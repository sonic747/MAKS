export type TabType = 'feed' | 'members' | 'trophies' | 'register' | 'backup';

export type BallRating = 's4' | 's3' | 's2' | 's1' | 'master' | 'elite';

export interface SquashMember {
  id: string;
  username: string;
  password?: string;
  name: string;
  avatar: string;
  role: 'admin' | 'captain' | 'member' | 'coach';
  roleLabel: string;
  isAdmin?: boolean;
  tenure: string;
  age: number;
  ballRating: BallRating;
  ratingLabel: string;
  ratingSub: string;
  club?: string;
  mainRacket?: string;
  primaryTeam: string;
  clubPass: string;
  trophiesCount: number;
  honors: HonorItem[];
  photos: MemberPhoto[];
  cheers: CheerMessage[];
  statusColor?: string;
  bio?: string;
  phone?: string;
  user_id?: string;
  created_at?: string;
  devicePlatform?: 'mobile' | 'desktop' | 'tablet' | 'unknown';
}

export interface HonorItem {
  id: string;
  title: string;
  organizer: string;
  rank: string;
  rankBadge: string;
  rankType: 'gold' | 'silver' | 'bronze';
  date: string;
  matchScore?: string;
  division?: string;
  imageUrl?: string;
}

export interface MemberPhoto {
  id: string;
  tag: string;
  title: string;
  imageUrl: string;
}

export interface CheerMessage {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorBadge?: string;
  isCaptain?: boolean;
  timeAgo: string;
  location: string;
  badgeTag?: string;
  badgeType?: 'pro' | 'kit' | 'trophy' | 'regular';
  title?: string;
  imageUrl?: string;
  caption: string;
  matchDuration?: string;
  setScore?: string;
  awardsDetail?: string;
  niceShots: number;
  isNiceShotGiven?: boolean;
  isBookmarked?: boolean;
  commentsCount: number;
  comments: PostComment[];
  category: 'all' | 'match' | 'awards';
}

export interface PostComment {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  timeAgo: string;
}

export interface ClubJsonData {
  club_name: string;
  total_active_members: number;
  max_capacity: number;
  last_synced_at: string;
  members: SquashMember[];
  posts: FeedPost[];
}
