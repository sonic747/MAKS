import React, { useState, useRef } from 'react';
import { X, Camera, Save, User } from 'lucide-react';
import { SquashMember, BallRating } from '../types';
import { compressImageFile } from '../utils/imageCompressor';

interface EditProfileModalProps {
  isOpen: boolean;
  currentUser: SquashMember;
  onClose: () => void;
  onUpdateMember: (updatedMember: SquashMember) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onUpdateMember,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(currentUser.name);
  const [age, setAge] = useState(currentUser.age);
  const [ballRating, setBallRating] = useState<BallRating>(currentUser.ballRating || 's2');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, {
          maxWidth: 600,
          maxHeight: 600,
          quality: 0.8,
          maxSizeBytes: 200 * 1024,
        });
        setAvatarUrl(compressed);
      } catch (err) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setAvatarUrl(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const ratingConfig: Record<BallRating, { label: string; sub: string; roleLabel: string; tenure: string }> = {
    s4: {
      label: 'S4 (입문/초보)',
      sub: '입문/초보부 (구력 1년 미만)',
      roleLabel: 'S4',
      tenure: 'S4 (입문/초보)',
    },
    s3: {
      label: 'S3 (중급)',
      sub: '중급부 (구력 1~3년차)',
      roleLabel: 'S3',
      tenure: 'S3 (중급)',
    },
    s2: {
      label: 'S2 (상급)',
      sub: '상급부 (구력 3~5년차)',
      roleLabel: 'S2',
      tenure: 'S2 (상급)',
    },
    s1: {
      label: 'S1 (최상급)',
      sub: '최상급부 (구력 5년 이상)',
      roleLabel: 'S1',
      tenure: 'S1 (최상급)',
    },
    master: {
      label: '마스터 (마스터부)',
      sub: '마스터부 (베테랑 마스터)',
      roleLabel: '마스터',
      tenure: '마스터 (마스터부)',
    },
    elite: {
      label: '선수 (엘리트선수)',
      sub: '엘리트선수부 (공식 선수/코치)',
      roleLabel: '선수',
      tenure: '선수 (엘리트선수)',
    },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config = ratingConfig[ballRating] || ratingConfig.s2;
    const roleLabel = currentUser.role === 'captain' ? '주장' : (currentUser.role === 'admin' ? 'ADMIN' : config.roleLabel);

    const updated: SquashMember = {
      ...currentUser,
      name: name.trim(),
      age,
      ballRating,
      ratingLabel: config.label,
      ratingSub: config.sub,
      roleLabel,
      tenure: config.tenure,
      phone: phone.trim(),
      avatar: avatarUrl,
      bio: bio.trim() || `${name.trim()} • [${config.label}] 정회원`,
    };

    onUpdateMember(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md my-auto rounded-2xl bg-[#161822] border border-white/[0.12] shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#1e222d] to-[#161822] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#f5c200]/10 text-[#f5c200]">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-chivo font-black text-white text-base">회원 프로필 수정</h3>
              <p className="text-[11px] text-gray-400">회원 정보 및 스쿼시 등급 변경</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Avatar Edit */}
          <div className="flex items-center gap-3.5 pb-2 border-b border-white/[0.08]">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-[#f5c200]/70 p-0.5 bg-[#0c0e15]">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover rounded-[8px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#f5c200] text-[#0f1118] flex items-center justify-center shadow hover:scale-105 transition-transform cursor-pointer"
              >
                <Camera size={12} strokeWidth={2.5} />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileSelect}
                className="hidden"
              />
            </div>

            <div className="flex-1 min-w-0">
              <label className="block text-xs font-chivo font-bold text-gray-200 mb-1">
                프로필 이미지 변경
              </label>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="text-xs text-[#f5c200] hover:underline font-chivo font-semibold cursor-pointer"
              >
                내 기기에서 사진 업로드
              </button>
            </div>
          </div>

          {/* Name & Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
                회원 이름 (실명) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0c0e15] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
                나이
              </label>
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0c0e15] border border-white/10">
                <button
                  type="button"
                  onClick={() => setAge((prev) => Math.max(10, prev - 1))}
                  className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-white font-black text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="font-chivo font-bold text-white text-xs">
                  {age} <span className="text-gray-400 text-[10px]">세</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAge((prev) => Math.min(75, prev + 1))}
                  className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-white font-black text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Squash Grade Selection: S4, S3, S2, S1, 마스터, 선수 */}
          <div>
            <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1.5">
              스쿼시 등급 선택
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* S4 */}
              <button
                type="button"
                onClick={() => setBallRating('s4')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  ballRating === 's4'
                    ? 'bg-[#f5c200] text-[#0f1118] border-[#f5c200] font-black'
                    : 'bg-[#0c0e15] text-gray-300 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="font-chivo text-[11px] font-bold">S4 (입문/초보)</div>
                <div className="text-[10px] opacity-80">입문/초보부</div>
              </button>

              {/* S3 */}
              <button
                type="button"
                onClick={() => setBallRating('s3')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  ballRating === 's3'
                    ? 'bg-[#f5c200] text-[#0f1118] border-[#f5c200] font-black'
                    : 'bg-[#0c0e15] text-gray-300 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="font-chivo text-[11px] font-bold">S3 (중급)</div>
                <div className="text-[10px] opacity-80">중급부</div>
              </button>

              {/* S2 */}
              <button
                type="button"
                onClick={() => setBallRating('s2')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  ballRating === 's2'
                    ? 'bg-[#f5c200] text-[#0f1118] border-[#f5c200] font-black'
                    : 'bg-[#0c0e15] text-gray-300 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="font-chivo text-[11px] font-bold">S2 (상급)</div>
                <div className="text-[10px] opacity-80">상급부</div>
              </button>

              {/* S1 */}
              <button
                type="button"
                onClick={() => setBallRating('s1')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  ballRating === 's1'
                    ? 'bg-[#f5c200] text-[#0f1118] border-[#f5c200] font-black'
                    : 'bg-[#0c0e15] text-gray-300 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="font-chivo text-[11px] font-bold">S1 (최상급)</div>
                <div className="text-[10px] opacity-80">최상급부</div>
              </button>

              {/* 마스터 */}
              <button
                type="button"
                onClick={() => setBallRating('master')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  ballRating === 'master'
                    ? 'bg-[#f5c200] text-[#0f1118] border-[#f5c200] font-black'
                    : 'bg-[#0c0e15] text-gray-300 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="font-chivo text-[11px] font-bold">마스터 (마스터부)</div>
                <div className="text-[10px] opacity-80">마스터부</div>
              </button>

              {/* 선수 */}
              <button
                type="button"
                onClick={() => setBallRating('elite')}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  ballRating === 'elite'
                    ? 'bg-[#f5c200] text-[#0f1118] border-[#f5c200] font-black'
                    : 'bg-[#0c0e15] text-gray-300 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="font-chivo text-[11px] font-bold">선수 (엘리트선수)</div>
                <div className="text-[10px] opacity-80">엘리트선수부</div>
              </button>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
              연락처 (휴대폰)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-XXXX-XXXX"
              className="w-full px-3 py-2 rounded-lg bg-[#0c0e15] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200]"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[11px] font-chivo font-bold text-gray-300 mb-1">
              한 줄 소개 (소개글)
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="자신을 소개해주세요"
              className="w-full px-3 py-2 rounded-lg bg-[#0c0e15] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200]"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#f5c200] hover:bg-[#ffe299] active:scale-[0.98] text-[#0f1118] font-chivo font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Save size={16} />
              <span>프로필 정보 저장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
