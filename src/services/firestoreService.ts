import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { SquashMember, FeedPost } from '../types';
import { INITIAL_MEMBERS, INITIAL_POSTS } from '../data/initialData';

const MEMBERS_COLLECTION = 'club_members';
const POSTS_COLLECTION = 'club_posts';
const META_DOC = 'club_metadata';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Real-time listener for Members collection.
 */
export function subscribeToMembers(
  onUpdate: (members: SquashMember[]) => void,
  onError?: (error: Error) => void
): () => void {
  const membersRef = collection(db, MEMBERS_COLLECTION);
  return onSnapshot(
    membersRef,
    (snapshot) => {
      if (snapshot.empty) {
        // Only if database is genuinely empty, check metadata asynchronously
        const metaDocRef = doc(db, META_DOC, 'system');
        getDoc(metaDocRef)
          .then((metaSnap) => {
            const isInitialized = metaSnap.exists() && metaSnap.data()?.membersInitialized;
            if (!isInitialized) {
              seedInitialData().catch(() => {});
            } else {
              onUpdate([]);
            }
          })
          .catch(() => {
            onUpdate([]);
          });
        return;
      }

      const members: SquashMember[] = [];
      snapshot.forEach((docSnap) => {
        const m = docSnap.data() as SquashMember;
        // Exclude super administrator from club members list
        if (m.id !== 'm-admin' && m.username !== 'admin' && m.role !== 'admin' && !m.isAdmin) {
          members.push(m);
        }
      });

      // Sort members (captain first, then name)
      members.sort((a, b) => {
        if (a.role === 'captain') return -1;
        if (b.role === 'captain') return 1;
        return a.name.localeCompare(b.name, 'ko');
      });

      // Cache to localStorage for 0-latency instant hydration
      try {
        localStorage.setItem('maks_squash_members_cache_v1', JSON.stringify(members));
      } catch (e) {
        // ignore
      }

      onUpdate(members);
    },
    async (err) => {
      console.warn('Firestore subscribeToMembers warning, trying server backup:', err);
      try {
        const res = await fetch('/api/members');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.members) && data.members.length > 0) {
            onUpdate(data.members);
            return;
          }
        }
      } catch (e) {
        // ignore
      }
      try {
        handleFirestoreError(err, OperationType.LIST, MEMBERS_COLLECTION);
      } catch (formattedErr) {
        if (onError) onError(formattedErr as Error);
      }
    }
  );
}

/**
 * Real-time listener for Posts collection
 */
export function subscribeToPosts(
  onUpdate: (posts: FeedPost[]) => void,
  onError?: (error: Error) => void
): () => void {
  const postsRef = collection(db, POSTS_COLLECTION);
  return onSnapshot(
    postsRef,
    (snapshot) => {
      if (snapshot.empty) {
        const metaDocRef = doc(db, META_DOC, 'system');
        getDoc(metaDocRef)
          .then((metaSnap) => {
            const isInitialized = metaSnap.exists() && metaSnap.data()?.postsInitialized;
            if (!isInitialized) {
              const batch = writeBatch(db);
              for (const post of INITIAL_POSTS) {
                const docRef = doc(db, POSTS_COLLECTION, post.id);
                batch.set(docRef, JSON.parse(JSON.stringify(post)));
              }
              batch.set(metaDocRef, { postsInitialized: true }, { merge: true });
              batch.commit().catch(() => {});
              onUpdate(INITIAL_POSTS);
            } else {
              onUpdate([]);
            }
          })
          .catch(() => {
            onUpdate([]);
          });
        return;
      }

      const posts: FeedPost[] = [];
      snapshot.forEach((docSnap) => {
        posts.push(docSnap.data() as FeedPost);
      });

      // Sort posts newest first based on id or timestamp
      posts.sort((a, b) => {
        const idA = a.id ? parseInt(a.id.replace(/\D/g, ''), 10) || 0 : 0;
        const idB = b.id ? parseInt(b.id.replace(/\D/g, ''), 10) || 0 : 0;
        return idB - idA;
      });

      try {
        localStorage.setItem('maks_squash_posts_cache_v1', JSON.stringify(posts));
      } catch (e) {
        // ignore
      }

      onUpdate(posts);
    },
    async (err) => {
      console.warn('Firestore subscribeToPosts warning, trying server backup:', err);
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.posts) && data.posts.length > 0) {
            onUpdate(data.posts);
            return;
          }
        }
      } catch (e) {
        // ignore
      }
      try {
        handleFirestoreError(err, OperationType.LIST, POSTS_COLLECTION);
      } catch (formattedErr) {
        if (onError) onError(formattedErr as Error);
      }
    }
  );
}

/**
 * Add or Update member in Firestore
 */
export async function saveMemberToFirestore(member: SquashMember): Promise<void> {
  const path = `${MEMBERS_COLLECTION}/${member.id}`;
  const sanitized = JSON.parse(JSON.stringify(member));

  try {
    const memberDoc = doc(db, MEMBERS_COLLECTION, member.id);
    await setDoc(memberDoc, sanitized, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }

  // Also sync to local server backup endpoint
  try {
    fetch('/api/members/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized),
    }).catch(() => {});
  } catch (e) {
    // ignore
  }
}

/**
 * Delete member from Firestore
 */
export async function deleteMemberFromFirestore(memberId: string): Promise<void> {
  const path = `${MEMBERS_COLLECTION}/${memberId}`;
  try {
    const memberDoc = doc(db, MEMBERS_COLLECTION, memberId);
    await deleteDoc(memberDoc);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }

  // Also sync deletion to server backup
  try {
    fetch(`/api/members/${memberId}`, {
      method: 'DELETE',
    }).catch(() => {});
  } catch (e) {
    // ignore
  }
}

/**
 * Add or Update post in Firestore and server backup
 */
export async function savePostToFirestore(post: FeedPost): Promise<void> {
  const path = `${POSTS_COLLECTION}/${post.id}`;
  const postDoc = doc(db, POSTS_COLLECTION, post.id);
  const sanitized = JSON.parse(JSON.stringify(post));

  // Double safeguard: ensure image dataUrl does not exceed Firestore's 1,048,576 bytes limit
  if (sanitized.imageUrl && sanitized.imageUrl.startsWith('data:image')) {
    const estimatedBytes = sanitized.imageUrl.length * 0.75;
    if (estimatedBytes > 600 * 1024) {
      try {
        const { compressDataUrl } = await import('../utils/imageCompressor');
        sanitized.imageUrl = await compressDataUrl(sanitized.imageUrl, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.75,
          maxSizeBytes: 400 * 1024,
        });
      } catch (err) {
        console.warn('Fallback compressing dataUrl:', err);
      }
    }
  }

  // 1. Save to Firestore
  try {
    await setDoc(postDoc, sanitized, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }

  // 2. Also sync to local server backup endpoint for multi-layer persistence
  try {
    fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized),
    }).catch(() => {});
  } catch (e) {
    // ignore
  }
}

/**
 * Delete post from Firestore and server backup
 */
export async function deletePostFromFirestore(postId: string): Promise<void> {
  const path = `${POSTS_COLLECTION}/${postId}`;
  try {
    const postDoc = doc(db, POSTS_COLLECTION, postId);
    await deleteDoc(postDoc);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }

  try {
    fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
    }).catch(() => {});
  } catch (e) {
    // ignore
  }
}

/**
 * Bulk import / restore all members and posts
 */
export async function syncAllToFirestore(
  members: SquashMember[],
  posts: FeedPost[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const m of members) {
      const mRef = doc(db, MEMBERS_COLLECTION, m.id);
      batch.set(mRef, JSON.parse(JSON.stringify(m)), { merge: true });
    }
    for (const p of posts) {
      const pRef = doc(db, POSTS_COLLECTION, p.id);
      batch.set(pRef, JSON.parse(JSON.stringify(p)), { merge: true });
    }
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${MEMBERS_COLLECTION}&${POSTS_COLLECTION}`);
  }
}

/**
 * Seed initial data if Firestore is empty on first load
 */
async function seedInitialData() {
  try {
    const batch = writeBatch(db);
    for (const member of INITIAL_MEMBERS) {
      const docRef = doc(db, MEMBERS_COLLECTION, member.id);
      batch.set(docRef, JSON.parse(JSON.stringify(member)));
    }
    for (const post of INITIAL_POSTS) {
      const docRef = doc(db, POSTS_COLLECTION, post.id);
      batch.set(docRef, JSON.parse(JSON.stringify(post)));
    }
    const metaDocRef = doc(db, META_DOC, 'system');
    batch.set(metaDocRef, { membersInitialized: true, postsInitialized: true }, { merge: true });
    await batch.commit();
    console.log('Seeded initial members and posts to Firestore');
  } catch (err) {
    console.error('Failed to seed initial members and posts:', err);
  }
}
