import JSZip from 'jszip';
import { SquashMember, FeedPost } from '../types';

export interface ZipBackupResult {
  blob: Blob;
  filename: string;
  stats: {
    membersCount: number;
    postsCount: number;
    imagesCount: number;
  };
}

export interface RestoredBackupData {
  members: SquashMember[];
  posts: FeedPost[];
  stats: {
    membersCount: number;
    postsCount: number;
    imagesRestored: number;
  };
}

/**
 * Creates a comprehensive ZIP backup containing:
 * 1. data.json: Complete structured data (members, posts, comments, honors, metadata)
 * 2. images/: Extracted standalone image files (post images, honor photos, member avatars)
 * 3. README.txt: Backup guide and metadata
 */
export async function createZipBackup(
  members: SquashMember[],
  posts: FeedPost[]
): Promise<ZipBackupResult> {
  const zip = new JSZip();
  const imagesFolder = zip.folder('images');
  let imagesCount = 0;

  // Deep clone to avoid mutating application state
  const membersCopy: SquashMember[] = JSON.parse(JSON.stringify(members));
  const postsCopy: FeedPost[] = JSON.parse(JSON.stringify(posts));

  // Helper to extract base64 dataUrl into zip images folder
  const processImage = (
    dataUrl: string | undefined,
    prefix: string
  ): { imagePath?: string; dataUrl?: string } => {
    if (!dataUrl) return {};

    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (match && imagesFolder) {
      const mime = match[1];
      const base64Data = match[2];
      let ext = 'jpg';
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('gif')) ext = 'gif';

      imagesCount++;
      const filename = `${prefix}.${ext}`;
      imagesFolder.file(filename, base64Data, { base64: true });
      return {
        imagePath: `images/${filename}`,
        dataUrl, // keep as fallback
      };
    }

    return { dataUrl };
  };

  // 1. Process Posts (including attached photos and comments)
  postsCopy.forEach((post, index) => {
    if (post.imageUrl && post.imageUrl.startsWith('data:image')) {
      const res = processImage(post.imageUrl, `post_${post.id || index + 1}`);
      (post as any).imagePath = res.imagePath;
    }
  });

  // 2. Process Members (including honors, member photos, avatars)
  membersCopy.forEach((member, mIdx) => {
    if (member.avatar && member.avatar.startsWith('data:image')) {
      const res = processImage(member.avatar, `avatar_${member.id || mIdx + 1}`);
      (member as any).avatarPath = res.imagePath;
    }

    if (member.honors && Array.isArray(member.honors)) {
      member.honors.forEach((honor, hIdx) => {
        if (honor.imageUrl && honor.imageUrl.startsWith('data:image')) {
          const res = processImage(
            honor.imageUrl,
            `honor_${member.id || mIdx + 1}_${honor.id || hIdx + 1}`
          );
          (honor as any).imagePath = res.imagePath;
        }
      });
    }

    if (member.photos && Array.isArray(member.photos)) {
      member.photos.forEach((photo, pIdx) => {
        if (photo.imageUrl && photo.imageUrl.startsWith('data:image')) {
          const res = processImage(
            photo.imageUrl,
            `photo_${member.id || mIdx + 1}_${photo.id || pIdx + 1}`
          );
          (photo as any).imagePath = res.imagePath;
        }
      });
    }
  });

  const exportPayload = {
    club_name: 'MAKS Squash Club',
    version: '2.0',
    backup_type: 'full_zip',
    exported_at: new Date().toISOString(),
    stats: {
      membersCount: membersCopy.length,
      postsCount: postsCopy.length,
      imagesCount,
    },
    members: membersCopy,
    posts: postsCopy,
  };

  // Add data.json to ZIP
  zip.file('data.json', JSON.stringify(exportPayload, null, 2));

  // Add README.txt
  const readmeText = `=================================================
MAKS 스쿼시 클럽 공식 전체 백업 패키지 (ZIP)
=================================================
백업 일시: ${new Date().toLocaleString('ko-KR')}
회원 수: ${membersCopy.length}명
공지 및 피드 게시글: ${postsCopy.length}건
보관된 첨부 사진: ${imagesCount}개

[폴더 구성]
- data.json: 회원 명부, 대회 시상(명예) 이력, 공지글 및 모든 댓글 데이터
- images/: 공지글 첨부 사진, 시상 이력 증빙 사진, 회원 프로필 사진 원본

[복원 방법]
MAKS 시스템의 [백업 및 클라우드 연동] 메뉴에서
이 ZIP 파일을 그대로 업로드하시면 모든 데이터와 사진이 100% 자동 복원됩니다.
=================================================`;
  zip.file('README.txt', readmeText);

  // Generate ZIP Blob
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `maks_squash_backup_${dateStr}.zip`;

  return {
    blob,
    filename,
    stats: {
      membersCount: membersCopy.length,
      postsCount: postsCopy.length,
      imagesCount,
    },
  };
}

/**
 * Restores data from either a ZIP file or a JSON string.
 */
export async function restoreBackupFile(file: File): Promise<RestoredBackupData> {
  const isZip = file.name.endsWith('.zip') || file.type.includes('zip');

  if (isZip) {
    const zip = await JSZip.loadAsync(file);

    // Look for data.json or backup_data.json
    let dataJsonFile = zip.file('data.json') || zip.file('backup_data.json');
    if (!dataJsonFile) {
      // Find any .json file in root
      const jsonFiles = zip.file(/\.json$/i);
      if (jsonFiles.length > 0) {
        dataJsonFile = jsonFiles[0];
      }
    }

    if (!dataJsonFile) {
      throw new Error('ZIP 압축 파일 내에 data.json 데이터 파일이 존재하지 않습니다.');
    }

    const jsonText = await dataJsonFile.async('string');
    const parsed = JSON.parse(jsonText);

    const members: SquashMember[] = Array.isArray(parsed.members) ? parsed.members : [];
    const posts: FeedPost[] = Array.isArray(parsed.posts) ? parsed.posts : [];
    let imagesRestored = 0;

    // Helper to restore image from ZIP if imagePath is set
    const restoreImage = async (
      imagePath: string | undefined,
      currentDataUrl: string | undefined
    ): Promise<string | undefined> => {
      if (imagePath) {
        // Strip leading slash if any
        const cleanPath = imagePath.replace(/^\//, '');
        const imgFile = zip.file(cleanPath);
        if (imgFile) {
          const base64Str = await imgFile.async('base64');
          let mime = 'image/jpeg';
          if (cleanPath.endsWith('.png')) mime = 'image/png';
          else if (cleanPath.endsWith('.webp')) mime = 'image/webp';
          else if (cleanPath.endsWith('.gif')) mime = 'image/gif';

          imagesRestored++;
          return `data:${mime};base64,${base64Str}`;
        }
      }
      return currentDataUrl;
    };

    // Restore posts images
    for (const post of posts) {
      const path = (post as any).imagePath;
      post.imageUrl = await restoreImage(path, post.imageUrl);
      delete (post as any).imagePath;
    }

    // Restore members avatars, honors images, photos
    for (const member of members) {
      const aPath = (member as any).avatarPath;
      member.avatar = (await restoreImage(aPath, member.avatar)) || member.avatar;
      delete (member as any).avatarPath;

      if (member.honors && Array.isArray(member.honors)) {
        for (const honor of member.honors) {
          const hPath = (honor as any).imagePath;
          honor.imageUrl = await restoreImage(hPath, honor.imageUrl);
          delete (honor as any).imagePath;
        }
      }

      if (member.photos && Array.isArray(member.photos)) {
        for (const photo of member.photos) {
          const pPath = (photo as any).imagePath;
          photo.imageUrl = (await restoreImage(pPath, photo.imageUrl)) || photo.imageUrl;
          delete (photo as any).imagePath;
        }
      }
    }

    return {
      members,
      posts,
      stats: {
        membersCount: members.length,
        postsCount: posts.length,
        imagesRestored,
      },
    };
  } else {
    // Standard JSON file restore
    const text = await file.text();
    const parsed = JSON.parse(text);
    const members: SquashMember[] = Array.isArray(parsed.members) ? parsed.members : [];
    const posts: FeedPost[] = Array.isArray(parsed.posts) ? parsed.posts : [];

    return {
      members,
      posts,
      stats: {
        membersCount: members.length,
        postsCount: posts.length,
        imagesRestored: 0,
      },
    };
  }
}
