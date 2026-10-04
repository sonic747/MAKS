import React, { useState, useRef } from 'react';
import { UserPlus, Camera, CheckCircle2, ArrowRight, Download, Smartphone } from 'lucide-react';
import { SquashMember, BallRating } from '../types';
import { compressImageFile } from '../utils/imageCompressor';

interface RegisterViewProps {
  members: SquashMember[];
  maxCapacity: number;
  onAddMember: (newMember: SquashMember) => void;
  onSelectMember: (memberId: string) => void;
  onOpenInstallModal?: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  members,
  maxCapacity,
  onAddMember,
  onSelectMember,
  onOpenInstallModal,
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState<number | ''>(28);
  const [ballRating, setBallRating] = useState<BallRating>('s2');
  const [phone, setPhone] = useState('010-5521-8840');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );
  const [agreePush, setAgreePush] = useState(true);

  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  ];

  const remainingSpots = Math.max(0, maxCapacity - members.length);
  const capacityPercent = Math.round((members.length / maxCapacity) * 100);

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

    if (!name.trim()) {
      alert('회원 이름을 입력해 주세요.');
      return;
    }

    if (members.length >= maxCapacity) {
      alert(`클럽 정원(${maxCapacity}명)이 마감되었습니다.`);
      return;
    }

    const cleanUsername = username.trim() || `user_${Date.now().toString().slice(-4)}`;
    const cleanPassword = password.trim() || '1234';

    // Duplicate ID check
    const isDuplicate = members.some(
      (m) => m.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    if (isDuplicate) {
      alert('이미 등록된 아이디입니다. 다른 아이디를 입력해 주세요.');
      return;
    }

    const currentConfig = ratingConfig[ballRating];

    const newMemberId = `m-${Date.now()}`;
    const newMember: SquashMember = {
      id: newMemberId,
      username: cleanUsername,
      password: cleanPassword,
      name: name.trim(),
      avatar: avatarUrl,
      role: ballRating === 'elite' ? 'coach' : 'member',
      roleLabel: currentConfig.roleLabel,
      tenure: currentConfig.tenure,
      age: age || 28,
      ballRating,
      ratingLabel: currentConfig.label,
      ratingSub: currentConfig.sub,
      primaryTeam: 'MAKS 스쿼시 클럽 공식 회원',
      clubPass: `#00${members.length + 25}`,
      trophiesCount: 0,
      statusColor: '#10b981',
      phone: phone || '010-0000-0000',
      bio: `${name.trim()} • [${currentConfig.label}] 클럽 정회원`,
      honors: [],
      photos: [],
      cheers: [],
    };

    onAddMember(newMember);
    onSelectMember(newMemberId);

    setFormSuccessMessage(`'${name.trim()}' 님이 새로운 클럽 정회원으로 성공적으로 등록되었습니다!`);
    setTimeout(() => {
      setFormSuccessMessage(null);
    }, 4000);

    // Reset Form
    setName('');
    setUsername('');
    setPassword('');
    setAge(28);
    setBallRating('s2');
  };

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

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-4 pb-24">
      {/* Top Banner */}
      <div className="rounded-xl bg-[#161822] border border-white/[0.08] p-4 shadow-lg">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-chivo font-black tracking-wider text-[#f5c200]">
            <UserPlus size={16} />
            <span>MEMBER REGISTRATION</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1e222d] border border-white/10 text-[10px] font-chivo font-bold text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>신규 회원 접수</span>
          </div>
        </div>

        <h2 className="font-chivo font-extrabold text-lg sm:text-xl text-white tracking-tight">
          클럽 신규 회원가입
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          MAKS 스쿼시 클럽 공식 명부에 새로운 회원을 등록합니다.
        </p>

        {/* Capacity Progress Bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300 font-chivo font-semibold">
              현재 등록 인원 <strong className="text-white">{members.length}명</strong> / 최대 {maxCapacity}명
            </span>
            <span className="text-[#f5c200] font-chivo font-bold text-xs">
              {remainingSpots}자리 여유 ({capacityPercent}%)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#11131a] overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#f5c200] transition-all duration-500"
              style={{ width: `${Math.min(capacityPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {formSuccessMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{formSuccessMessage}</span>
        </div>
      )}

      {/* Member Registration Form */}
      <form onSubmit={handleSubmit} className="rounded-xl bg-[#161822] border border-white/[0.08] p-4 space-y-4 shadow-lg">
        {/* Profile Picture Registration */}
        <div className="flex items-center gap-3.5 pb-2 border-b border-white/[0.08]">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-[#f5c200]/70 p-0.5 bg-[#11131a]">
              <img
                src={avatarUrl}
                alt="프로필 미리보기"
                className="w-full h-full object-cover rounded-[8px]"
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#f5c200] text-[#0f1118] flex items-center justify-center shadow hover:scale-105 transition-transform cursor-pointer"
              title="사진 파일 직접 업로드"
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
              프로필 사진 선택
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {sampleAvatars.map((url, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setAvatarUrl(url)}
                  className={`w-7 h-7 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    avatarUrl === url
                      ? 'border-[#f5c200] scale-110 shadow'
                      : 'border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={url}
                    alt={`sample ${idx}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Member Name & Login ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-chivo font-bold text-gray-300 mb-1">
              회원 이름 (실명) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full px-3 py-2 rounded-lg bg-[#11131a] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f5c200]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-chivo font-bold text-gray-300 mb-1">
              로그인 아이디 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="예: gildong_squash"
              className="w-full px-3 py-2 rounded-lg bg-[#11131a] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f5c200]"
              required
            />
          </div>
        </div>

        {/* Password & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-chivo font-bold text-gray-300 mb-1">
              비밀번호 설정 <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full px-3 py-2 rounded-lg bg-[#11131a] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f5c200]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-chivo font-bold text-gray-300 mb-1">
              연락처 (휴대폰)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full px-3 py-2 rounded-lg bg-[#11131a] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f5c200]"
            />
          </div>
        </div>

        {/* Age */}
        <div>
          <label className="block text-xs font-chivo font-bold text-gray-300 mb-1">
            나이
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="나이 입력"
            className="w-full sm:w-1/2 px-3 py-2 rounded-lg bg-[#11131a] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5c200]"
          />
        </div>

        {/* Squash Grade Selection: S4, S3, S2, S1, 마스터, 선수 */}
        <div>
          <label className="block text-xs font-chivo font-bold text-gray-300 mb-1.5">
            스쿼시 등급 선택 <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {/* S4 (입문/초보) */}
            <button
              type="button"
              onClick={() => setBallRating('s4')}
              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                ballRating === 's4'
                  ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500'
                  : 'border-white/10 bg-[#11131a] text-gray-400 hover:text-white'
              }`}
            >
              <div className="font-chivo font-bold text-white">S4 (입문/초보)</div>
              <div className="text-[10px] text-gray-400 mt-0.5">입문/초보부</div>
            </button>

            {/* S3 (중급) */}
            <button
              type="button"
              onClick={() => setBallRating('s3')}
              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                ballRating === 's3'
                  ? 'border-blue-500 bg-blue-950/40 text-blue-300 ring-1 ring-blue-500'
                  : 'border-white/10 bg-[#11131a] text-gray-400 hover:text-white'
              }`}
            >
              <div className="font-chivo font-bold text-white">S3 (중급)</div>
              <div className="text-[10px] text-gray-400 mt-0.5">중급부</div>
            </button>

            {/* S2 (상급) */}
            <button
              type="button"
              onClick={() => setBallRating('s2')}
              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                ballRating === 's2'
                  ? 'border-[#f5c200] bg-[#f5c200]/10 text-[#f5c200] ring-1 ring-[#f5c200]'
                  : 'border-white/10 bg-[#11131a] text-gray-400 hover:text-white'
              }`}
            >
              <div className="font-chivo font-bold text-white">S2 (상급)</div>
              <div className="text-[10px] text-gray-400 mt-0.5">상급부</div>
            </button>

            {/* S1 (최상급) */}
            <button
              type="button"
              onClick={() => setBallRating('s1')}
              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                ballRating === 's1'
                  ? 'border-purple-500 bg-purple-950/40 text-purple-300 ring-1 ring-purple-500'
                  : 'border-white/10 bg-[#11131a] text-gray-400 hover:text-white'
              }`}
            >
              <div className="font-chivo font-bold text-white">S1 (최상급)</div>
              <div className="text-[10px] text-gray-400 mt-0.5">최상급부</div>
            </button>

            {/* 마스터 (마스터부) */}
            <button
              type="button"
              onClick={() => setBallRating('master')}
              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                ballRating === 'master'
                  ? 'border-amber-400 bg-amber-950/40 text-amber-300 ring-1 ring-amber-400'
                  : 'border-white/10 bg-[#11131a] text-gray-400 hover:text-white'
              }`}
            >
              <div className="font-chivo font-bold text-white">마스터 (마스터부)</div>
              <div className="text-[10px] text-gray-400 mt-0.5">마스터부 베테랑</div>
            </button>

            {/* 선수 (엘리트선수) */}
            <button
              type="button"
              onClick={() => setBallRating('elite')}
              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                ballRating === 'elite'
                  ? 'border-red-500 bg-red-950/40 text-red-300 ring-1 ring-red-500'
                  : 'border-white/10 bg-[#11131a] text-gray-400 hover:text-white'
              }`}
            >
              <div className="font-chivo font-bold text-white">선수 (엘리트선수)</div>
              <div className="text-[10px] text-gray-400 mt-0.5">엘리트선수부</div>
            </button>
          </div>
        </div>

        {/* 바탕화면 MAKS 아이콘 설명 화면 (처음 가입화면에 포함) */}
        <div className="p-4 rounded-xl bg-[#0c0e15] border border-[#f5c200]/40 space-y-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow ring-1 ring-[#f5c200]/50 p-0.5 bg-[#0f1118] shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="MAKS App Icon"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-chivo font-black text-white flex items-center gap-1.5">
                <span>바탕화면에 MAKS 바로가기 아이콘 생성</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[#f5c200] text-[9px] font-bold">홈 화면</span>
              </div>
              <div className="text-[11px] text-gray-300 mt-0.5 leading-snug">
                앱스토어 설치 없이 스마트폰 홈 화면 또는 PC 바탕화면에 1초 만에 바로가기 아이콘을 생성할 수 있습니다.
              </div>
            </div>
          </div>

          {/* Device Specific Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-300 bg-black/40 p-2.5 rounded-lg border border-white/5 font-sans">
            <div className="space-y-0.5">
              <span className="text-[#f5c200] font-bold">🍎 아이폰 / iPad (Safari):</span>
              <p className="text-gray-400">하단 공유 버튼 <span className="text-white font-bold">[↑]</span> 탭 ➔ <span className="text-white font-bold">'홈 화면에 추가'</span> 선택</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[#f5c200] font-bold">🤖 안드로이드 & 💻 PC:</span>
              <p className="text-gray-400">브라우저 메뉴 <span className="text-white font-bold">[⋮]</span> 탭 ➔ <span className="text-white font-bold">'홈 화면에 추가'</span> 또는 주소창 <span className="text-white font-bold">[설치 ⊕]</span></p>
            </div>
          </div>

          {onOpenInstallModal && (
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="w-full py-2.5 px-3 rounded-lg bg-[#1e222d] hover:bg-[#282d3c] border border-[#f5c200]/30 text-white text-xs font-chivo font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Download size={14} className="text-[#f5c200]" />
              <span>바탕화면에 MAKS 바로가기 아이콘 추가하기</span>
            </button>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#f5c200] hover:bg-[#ffe299] active:scale-[0.98] text-[#0f1118] font-chivo font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <span>클럽 정회원 등록 완료</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};
