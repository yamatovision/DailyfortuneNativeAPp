import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SajuProfileModal from '../profile/SajuProfileModal';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from './LoadingIndicator';

interface RequireSajuProfileProps {
  children: React.ReactNode;
}

/**
 * 四柱推命プロフィールが必要なページをラップするコンポーネント
 * プロフィールが存在しない場合、入力モーダルを表示します
 */
const RequireSajuProfile: React.FC<RequireSajuProfileProps> = ({ children }) => {
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  
  // プロフィールが存在するかを判定する関数
  const hasSajuProfile = () => {
    if (!userProfile) return false;
    
    // 四柱推命情報が存在するかを確認
    const hasFourPillars = userProfile.fourPillars && 
      Object.keys(userProfile.fourPillars).length > 0 &&
      userProfile.fourPillars.day?.heavenlyStem;
    
    // 必要な基本情報が存在するかを確認
    const hasBasicInfo = 
      userProfile.birthDate && 
      userProfile.birthTime && 
      userProfile.birthPlace && 
      userProfile.gender;
    
    // 四柱推命の属性情報が存在するか確認
    const hasElementInfo = userProfile.elementAttribute && userProfile.elementAttribute.length > 0;
    
    return hasFourPillars && hasBasicInfo && hasElementInfo;
  };
  
  useEffect(() => {
    // すでにチェック済みの場合は何もしない（重要）
    if (profileChecked) return;
    
    // 認証ロード完了時のみチェックを実行
    if (!loading) {
      // ユーザープロフィールのロード完了後に四柱推命情報をチェック
      if (userProfile) {
        if (!hasSajuProfile()) {
          console.log('四柱推命プロフィールが見つかりません。入力モーダルを表示します。');
          setShowProfileModal(true);
          setProfileChecked(true);
        } else {
          console.log('四柱推命プロフィールが存在します。続行します。');
          setProfileChecked(true);
        }
      } else {
        // ユーザープロフィールがない場合（ロードは完了しているが取得できていない）
        console.log('ユーザープロフィールがありません。認証中の可能性があります。');
      }
    }
  }, [userProfile, loading, profileChecked]);
  
  // ロード中の表示
  if (loading && !profileChecked) {
    return <LoadingIndicator message="プロフィール情報を確認中..." size="medium" />;
  }
  
  const handleProfileComplete = () => {
    console.log('四柱推命プロフィールが正常に登録されました。');
    setShowProfileModal(false);
    setProfileChecked(true);
    
    // リロードせずにRedirect to /fortune
    navigate('/fortune');
  };
  
  const handleModalClose = () => {
    console.log('ユーザーが四柱推命プロフィール入力をスキップしました。');
    setShowProfileModal(false);
    
    // プロフィール入力がスキップされた場合はプロフィールページにリダイレクト
    navigate('/profile');
  };
  
  return (
    <>
      {children}
      
      <SajuProfileModal 
        open={showProfileModal} 
        onClose={handleModalClose}
        onComplete={handleProfileComplete}
        isRequired={true} // オンボーディング時は必須モードに設定
      />
    </>
  );
};

export default RequireSajuProfile;