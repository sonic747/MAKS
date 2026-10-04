import React, { useRef, useState } from 'react';
import {
  HardDrive,
  FileDown,
  FileUp,
  Database,
  RefreshCw,
  Smartphone,
  Monitor,
  CheckCircle2,
  CloudCheck,
  Cloud,
  Archive,
  FileText,
  Loader2,
} from 'lucide-react';
import { SquashMember, FeedPost } from '../types';

interface BackupViewProps {
  members: SquashMember[];
  posts?: FeedPost[];
  maxCapacity: number;
  onDownloadZip: () => void;
  onDownloadJson: () => void;
  onRestoreFile: (file: File) => Promise<boolean>;
  onSyncServer?: () => Promise<void>;
  isSyncing?: boolean;
}

export const BackupView: React.FC<BackupViewProps> = ({
  members,
  posts = [],
  maxCapacity,
  onDownloadZip,
  onDownloadJson,
  onRestoreFile,
  onSyncServer,
  isSyncing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsRestoring(true);
      try {
        const success = await onRestoreFile(file);
        if (success) {
          alert('데이터 및 첨부 사진 복원과 클라우드 동기화가 성공적으로 완료되었습니다.');
        } else {
          alert('올바른 백업 파일(ZIP 또는 JSON) 형식이 아닙니다.');
        }
      } catch (err: any) {
        alert(`복원 중 오류가 발생했습니다: ${err?.message || err}`);
      } finally {
        setIsRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleManualSync = async () => {
    if (onSyncServer) {
      await onSyncServer();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-4 pb-24">
      {/* Top Protocol Card */}
      <div className="rounded-xl bg-[#161822] border border-white/[0.08] p-4 shadow-lg">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-chivo font-black tracking-wider text-[#f5c200]">
            <Database size={16} />
            <span>CLOUD REAL-TIME SYNC & BACKUP</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1e222d] border border-white/10 text-[10px] font-chivo font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>모바일 ↔ PC 실시간 연동 중</span>
          </div>
        </div>

        <h2 className="font-chivo font-extrabold text-lg sm:text-xl text-white tracking-tight">
          모바일 & 웹(Vercel 배포) 공용 실시간 회원 관리
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          스마트폰 모바일 브라우저와 PC 웹 브라우저가 Google Firebase Firestore 실시간 데이터베이스로 즉시 연결되어, PC에서 회원을 삭제하거나 추가하면 모바일 화면에도 실시간으로 100% 동일하게 반영됩니다.
        </p>

        {/* Platform Status Banner */}
        <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-[#181b26] to-[#12141c] border border-[#f5c200]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-gray-300">
              <Smartphone size={16} className="text-[#f5c200]" />
              <span className="text-xs font-bold font-chivo">스마트폰 (모바일)</span>
            </div>
            <span className="text-emerald-400 font-bold text-xs">⚡ 실시간</span>
            <div className="flex items-center gap-1 text-gray-300">
              <Monitor size={16} className="text-[#f5c200]" />
              <span className="text-xs font-bold font-chivo">PC 웹 브라우저</span>
            </div>
          </div>
          {onSyncServer && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg bg-[#f5c200] hover:bg-[#ffe299] text-[#0f1118] text-xs font-chivo font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? '동기화 중...' : '클라우드 동기화'}</span>
            </button>
          )}
        </div>

        {syncSuccess && (
          <div className="mt-2 p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 size={14} />
            <span>모든 기기의 데이터가 클라우드와 완벽하게 동기화되었습니다!</span>
          </div>
        )}

        {/* Status Stats: 모든 게시물, 회원정보 연동 */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/[0.08]">
          <div className="p-2.5 rounded-lg bg-[#11131a] border border-white/5">
            <span className="text-[10px] text-gray-400 block font-chivo">실시간 연동 회원</span>
            <span className="font-chivo font-black text-sm text-white">
              {members.length} <span className="text-xs text-gray-400">/ {maxCapacity}명</span>
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#11131a] border border-white/5">
            <span className="text-[10px] text-gray-400 block font-chivo">실시간 연동 게시물</span>
            <span className="font-chivo font-black text-sm text-[#f5c200]">
              {posts.length}건
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#11131a] border border-white/5">
            <span className="text-[10px] text-gray-400 block font-chivo">동기화 엔진</span>
            <span className="font-chivo font-bold text-xs text-emerald-400 truncate block">
              Firestore 실시간 연동
            </span>
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Export / Download */}
        <div className="p-4 rounded-xl bg-[#161822] border border-white/[0.08] flex flex-col justify-between space-y-3 shadow-lg">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#f5c200]/10 border border-[#f5c200]/30 flex items-center justify-center text-[#f5c200] mb-2">
              <Archive size={22} />
            </div>
            <h3 className="font-chivo font-black text-white text-sm">
              데이터 및 첨부 사진 백업 다운로드
            </h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              회원 명부, 게시물(제목, 내용, 모든 댓글), 시상(명예) 이력과 모든 첨부 사진(원본 파일)을 안전하게 백업합니다.
            </p>
          </div>

          <div className="space-y-2">
            {/* ZIP Backup Button (Recommended) */}
            <button
              onClick={onDownloadZip}
              className="w-full py-2.5 px-3 rounded-lg bg-[#f5c200] hover:bg-[#ffe299] text-[#0f1118] font-chivo font-black text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer active:scale-95"
            >
              <Archive size={15} />
              <span>전체 압축 백업(ZIP) 다운로드 (사진+데이터 통합, 권장)</span>
            </button>

            {/* JSON Backup Button */}
            <button
              onClick={onDownloadJson}
              className="w-full py-2 px-3 rounded-lg bg-[#1e222d] hover:bg-[#282d3c] border border-white/10 text-gray-300 hover:text-white font-chivo font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FileText size={13} />
              <span>단일 JSON 파일 다운로드</span>
            </button>
          </div>
        </div>

        {/* Import / Restore */}
        <div className="p-4 rounded-xl bg-[#161822] border border-white/[0.08] flex flex-col justify-between space-y-3 shadow-lg">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2">
              <FileUp size={22} />
            </div>
            <h3 className="font-chivo font-black text-white text-sm">
              백업 파일 업로드 및 클라우드 복원
            </h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              백업된 <b>ZIP 압축 파일(사진 포함)</b> 또는 <b>JSON 파일</b>을 불러와 Firestore 클라우드 DB와 모든 기기에 즉시 복원합니다.
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.json,application/zip,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isRestoring}
              className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-chivo font-bold text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {isRestoring ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>백업 파일 압축 해제 및 복원 중...</span>
                </>
              ) : (
                <>
                  <FileUp size={14} />
                  <span>백업 파일 선택 및 복원 (ZIP 또는 JSON)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Web Push (Google FCM) Monitoring & Broadcast Console (Admin) */}
      {/* MAKS App Shortcut & Badging Status */}
      <div className="rounded-xl bg-[#161822] border border-[#f5c200]/30 p-4 space-y-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f5c200]/15 border border-[#f5c200]/30 flex items-center justify-center text-[#f5c200]">
              <span className="text-base">📱</span>
            </div>
            <div>
              <h3 className="font-chivo font-black text-sm text-white flex items-center gap-1.5">
                <span>MAKS 바탕화면 단축아이콘 & 새 게시물 뱃지 관리</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[#f5c200] text-[9px] font-bold">PWA</span>
              </h3>
              <p className="text-[11px] text-gray-400">
                PC 바탕화면/작업표시줄 및 스마트폰 홈 화면 단축아이콘 연동 현황
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#11131a] border border-white/5 space-y-2 text-xs text-gray-300">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">단축아이콘 명칭</span>
            <span className="font-chivo font-bold text-white">MAKS</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">읽지 않은 게시물 수량 뱃지</span>
            <span className="font-chivo font-bold text-[#f5c200]">아이콘 우측 상단 빨간색 숫자(Badging API) 및 탭 타이틀 자동 표기</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">설치 방식</span>
            <span className="font-chivo font-bold text-emerald-400">앱스토어 없이 1클릭 홈 화면 생성 (iOS Safari & Chrome PWA)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
