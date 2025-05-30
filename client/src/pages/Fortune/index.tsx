import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Paper, Button, Tooltip, IconButton, Snackbar, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FortuneCard from '../../components/fortune/FortuneCard';
import LuckyItems from '../../components/fortune/LuckyItems';
import FortuneDetails from '../../components/fortune/FortuneDetails';
import TeamFortuneRanking from '../../components/fortune/TeamFortuneRanking';
import AiConsultButton from '../../components/fortune/AiConsultButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import fortuneService from '../../services/fortune.service';
import { IFortune, IFortuneDashboardResponse } from '../../../../shared';
import { useAuth } from '../../contexts/AuthContext';
import { useNetworkAwareDataSync } from '../../components/network';
import './../../components/fortune/styles.css';


const Fortune: React.FC = () => {
  const [fortune, setFortune] = useState<IFortune | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'warning' | 'error'
  });
  
  // 認証コンテキストから userProfile を取得
  const { userProfile } = useAuth();
  
  // ネットワークの状態監視と運勢データ連携
  const { wasDisconnected } = useNetworkAwareDataSync((connected) => {
    // オンラインに戻ったときの処理
    if (connected && wasDisconnected) {
      setNotification({
        open: true,
        message: 'ネットワークに接続されました。最新データを取得しています...',
        severity: 'info'
      });
      
      // 運勢データを再取得（fetchDashboard内でrefreshingがtrueに設定される）
      if (userProfile) {
        fetchDashboard();
      }
    }
  });

  // アプリマウント時に日付チェックを行う
  useEffect(() => {
    const checkForDateChange = async () => {
      try {
        // 日付変更チェックを実行
        const wasUpdated = await fortuneService.checkDateChange();
        if (wasUpdated && userProfile) {
          // 日付が変わっていた場合のみロード表示
          setLoading(true);
          setRefreshing(true); // 追加: 日付変更時も豆知識を表示する
          setNotification({
            open: true,
            message: '日付が変わりました。今日の運勢を取得しています...',
            severity: 'info'
          });
          // データ取得は fetchDashboard 内で行われる
        }
      } catch (error) {
        console.error('運勢ページでの日付チェックエラー:', error);
      }
    };
    
    checkForDateChange();
  }, []); // コンポーネントマウント時に1回だけ実行

  // userProfile の変更を監視して運勢データとチームリストを取得
  useEffect(() => {
    // ユーザープロファイルがロードされていない場合は何もしない
    if (!userProfile) {
      console.log('ユーザープロファイルがロード中のため、運勢データ取得を待機します');
      return;
    }

    // ダッシュボードのフェッチ処理
    fetchDashboard();
  }, [userProfile]); // userProfileが変更されたときに再実行
  
  // ダッシュボードデータを取得する関数
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setRefreshing(true); // 追加: 初期ロード時も豆知識を表示するために refreshing を true に設定
      console.log('認証済みユーザープロファイルでの運勢ダッシュボード取得開始', { userId: userProfile?.id });
      
      // 統合ダッシュボードデータを取得
      const dashboardData: IFortuneDashboardResponse = await fortuneService.getFortuneDashboard();
      
      // 個人運勢を設定
      if (dashboardData.personalFortune) {
        setFortune(dashboardData.personalFortune);
        setError(null);

        // 日付をフォーマット
        const date = dashboardData.personalFortune.date instanceof Date 
          ? dashboardData.personalFortune.date 
          : new Date(dashboardData.personalFortune.date);
        
        setCurrentDate(fortuneService.formatDate(date));
      }
      
    } catch (err: any) {
      console.error('運勢ダッシュボードの取得に失敗しました', err);
      
      // エラーメッセージを設定
      if (err.response && err.response.status === 404) {
        // 運勢データがない場合は特定のエラータイプを設定（後でボタン表示の判断に使用）
        setError('FORTUNE_NOT_FOUND');
      } else if (err.response && err.response.status === 400 && 
               err.response.data && err.response.data.code === 'MISSING_SAJU_PROFILE') {
        // 四柱推命プロフィールがない場合
        setError('SAJU_PROFILE_REQUIRED');
      } else if (err.response && err.response.status === 401) {
        // 認証エラーの場合、少し待機してから再試行 (認証処理完了待ち)
        console.log('認証エラー、3秒後に再試行します');
        setTimeout(() => {
          // ローディング状態を維持したまま再試行フラグを設定
          setError(null);
          fetchDashboard();
        }, 3000);
        return; // ここでreturnして下のfinallyブロックを実行しない
      } else {
        // その他のエラー
        setError('運勢データの取得に失敗しました。しばらくしてからもう一度お試しください。');
      }
      
      // 失敗時はデータをクリア
      setFortune(null);
    } finally {
      setRefreshing(false); // 追加: 処理完了時に refreshing を false に戻す
      setLoading(false);
    }
  };
  

  // コンテンツが読み込まれた後にアニメーションを有効化
  useEffect(() => {
    const animateSections = () => {
      const sections = document.querySelectorAll('.animate-on-load');
      sections.forEach((section, index) => {
        setTimeout(() => {
          section.classList.add('animated-section');
        }, index * 150); // 各セクションを順番に表示
      });
    };

    if (fortune && !loading) {
      setTimeout(animateSections, 100);
    }
  }, [fortune, loading]);


  // 運勢情報を手動で更新
  const handleRefreshFortune = async () => {
    if (refreshing) return; // 更新中の場合は何もしない
    
    setRefreshing(true);
    setError(null);
    
    try {
      // 個人運勢の更新
      const updatedFortune = await fortuneService.refreshDailyFortune();
      
      // 更新成功
      setFortune(updatedFortune);
      
      // 日付をフォーマット
      const date = updatedFortune.date instanceof Date 
        ? updatedFortune.date 
        : new Date(updatedFortune.date);
      
      setCurrentDate(fortuneService.formatDate(date));
      
      // 更新成功通知
      setNotification({
        open: true,
        message: '今日の運勢情報を更新しました',
        severity: 'success'
      });
      
      // アニメーションの再トリガー
      setTimeout(() => {
        const sections = document.querySelectorAll('.animate-on-load');
        sections.forEach((section, index) => {
          section.classList.remove('animated-section');
          setTimeout(() => {
            section.classList.add('animated-section');
          }, 50 + index * 100);
        });
      }, 300);
      
    } catch (err: any) {
      console.error('運勢情報の更新に失敗しました', err);
      
      // エラーメッセージの詳細化
      let errorMessage = '運勢情報の更新に失敗しました。';
      
      // エラー種別に応じたメッセージ
      if (err.response && err.response.status === 404) {
        errorMessage += '四柱推命情報が不足しているか、運勢データが見つかりません。プロフィール設定を確認してください。';
        setError('FORTUNE_NOT_FOUND');
      } else if (err.response && err.response.status === 401) {
        errorMessage += '認証エラーが発生しました。再ログインしてください。';
        setError(errorMessage);
      } else if (err.response && err.response.status === 400 && 
                err.response.data && err.response.data.code === 'MISSING_SAJU_PROFILE') {
        errorMessage += '四柱推命プロフィールが必要です。プロフィール設定を完了してください。';
        setError('SAJU_PROFILE_REQUIRED');
      } else {
        errorMessage += 'しばらくしてからもう一度お試しください。';
        setError(errorMessage);
      }
      
      // 更新失敗通知
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  // 運勢データを手動で生成
  const handleGenerateFortune = async () => {
    if (refreshing) return; // 更新中の場合は何もしない
    
    setRefreshing(true);
    setLoading(true); // ローディング状態にして、処理中はローディング画面を表示
    setError(null);
    
    try {
      // 運勢生成APIを呼び出し
      const newFortune = await fortuneService.generateFortune();
      
      // 生成成功
      setFortune(newFortune);
      
      // 日付をフォーマット
      const date = newFortune.date instanceof Date 
        ? newFortune.date 
        : new Date(newFortune.date);
      
      setCurrentDate(fortuneService.formatDate(date));
      
      // 成功通知
      setNotification({
        open: true,
        message: '今日の運勢データを生成しました',
        severity: 'success'
      });
      
      // 重要：refreshingをfalseにしてからloadingをfalseにする
      setRefreshing(false);
      setLoading(false);
      
      // アニメーションのトリガー
      setTimeout(() => {
        const sections = document.querySelectorAll('.animate-on-load');
        sections.forEach((section, index) => {
          setTimeout(() => {
            section.classList.add('animated-section');
          }, 50 + index * 100);
        });
      }, 300);
      
    } catch (err: any) {
      console.error('運勢データの生成に失敗しました', err);
      
      // エラーメッセージの詳細化
      let errorMessage = '運勢データの生成に失敗しました。';
      
      // エラー種別に応じたメッセージ
      if (err.response && err.response.status === 400 && 
          err.response.data && err.response.data.code === 'MISSING_SAJU_PROFILE') {
        errorMessage += '四柱推命プロフィールの設定が必要です。';
        
        // プロフィールがないので、対応するUIを表示するためにエラーステートを設定
        // しかしローディング中は維持したままにして、UIの切り替わりを遅延させる
        setTimeout(() => {
          setError('SAJU_PROFILE_REQUIRED');
          setLoading(false); // ここでローディングを終了
        }, 500); // 少し遅延させてローディング表示を維持
        
      } else if (err.response && err.response.status === 401) {
        errorMessage += '認証エラーが発生しました。再ログインしてください。';
        setError(errorMessage);
        setLoading(false);
      } else {
        errorMessage += 'しばらくしてからもう一度お試しください。';
        setError(errorMessage);
        setLoading(false);
      }
      
      // 生成失敗通知
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      // 成功時はすでにrefreshingをfalseにしているため、エラー時のみここで実行される
      if (refreshing) {
        setRefreshing(false);
      }
      // loadingはエラーハンドリング内で管理するため、ここではクリアしない
    }
  };
  
  // 通知を閉じる
  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 2, pb: 10, minHeight: '100vh', bgcolor: 'var(--bg-paper, #f5f5f5)' }}>
      {/* 通知 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      {/* 日付表示のみ（更新アイコンを削除） */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1, mb: 1 }}>
        {currentDate && (
          <Typography 
            variant="body1" 
            align="center" 
            className="date-display"
            sx={{ 
              color: 'primary.dark',
              fontWeight: 400
            }}
          >
            <span style={{ fontWeight: 500 }}>{currentDate}</span>の運勢
          </Typography>
        )}
      </Box>
      
      
      {/* タブ切り替えを削除 */}
      
      {loading ? (
        <LoadingOverlay 
          isLoading={loading}
          variant="transparent"
          contentType={refreshing ? "tips" : "simple"}
          message={refreshing ? "運勢情報を生成中..." : "運勢データを読み込み中..."}
          category="fortune"
          showProgress={refreshing}
          estimatedTime={refreshing ? 15 : 8}
        >
          {fortune && (
            <Box sx={{ opacity: 0.5 }}>
              <FortuneCard fortune={fortune} />
              <LuckyItems fortune={fortune} />
            </Box>
          )}
        </LoadingOverlay>
      ) : error ? (
        <>
          {error === 'FORTUNE_NOT_FOUND' ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Alert 
                severity="info" 
                sx={{ 
                  mt: 2,
                  mb: 3,
                  borderRadius: 3,
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                今日の運勢データはまだ生成されていません。「運勢を生成する」ボタンをクリックして、今日の運勢を確認しましょう。
              </Alert>
              
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleGenerateFortune}
                disabled={refreshing}
                size="large"
                startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{
                  borderRadius: 30,
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
                  boxShadow: '0 4px 10px rgba(156, 39, 176, 0.25)',
                  '&:hover': {
                    boxShadow: '0 6px 15px rgba(156, 39, 176, 0.35)',
                  }
                }}
              >
                {refreshing ? '生成中...' : '今日の運勢を生成する'}
              </Button>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 3, maxWidth: 500, mx: 'auto' }}>
                運勢データは通常、深夜に自動生成されますが、手動で生成することもできます。
                生成には四柱推命プロフィール情報が必要です。
              </Typography>
            </Box>
          ) : error === 'SAJU_PROFILE_REQUIRED' ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Alert 
                severity="warning" 
                sx={{ 
                  mt: 2,
                  mb: 3,
                  borderRadius: 3,
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                運勢データの生成には四柱推命プロフィールの設定が必要です。
              </Alert>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                パーソナライズされた運勢予測を受け取るには、四柱推命プロフィールの設定が必要です。
              </Typography>
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => window.location.href = "/profile"}
                sx={{
                  borderRadius: 30,
                  px: 3,
                  py: 1,
                  background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
                  boxShadow: '0 4px 10px rgba(156, 39, 176, 0.25)',
                  '&:hover': {
                    boxShadow: '0 6px 15px rgba(156, 39, 176, 0.35)',
                  }
                }}
              >
                四柱推命プロフィールを設定する
              </Button>
            </Box>
          ) : (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                borderRadius: 3
              }}
            >
              {error}
            </Alert>
          )}
        </>
      ) : (
        <>
          {/* 個人運勢データの表示 */}
          {fortune ? (
            <>
              {/* 運勢カード（アニメーション付き） */}
              <div className="animate-on-load">
                <FortuneCard fortune={fortune} />
              </div>
              
              {/* ラッキーアイテム（アニメーション付き） */}
              <div className="animate-on-load">
                <LuckyItems fortune={fortune} />
              </div>
              
              {/* 運勢詳細（アニメーション付き） */}
              <Paper 
                elevation={1}
                className="animate-on-load"
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 3px 8px rgba(156, 39, 176, 0.1)',
                  mb: 3
                }}
              >
                <FortuneDetails fortune={fortune} />
              </Paper>
              
            </>
          ) : (
            // データがない場合
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Alert 
                severity="info" 
                sx={{ 
                  mt: 2,
                  mb: 3,
                  borderRadius: 3,
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                個人運勢データが見つかりません。
              </Alert>
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleRefreshFortune}
                disabled={refreshing}
                sx={{
                  borderRadius: 30,
                  px: 3,
                  py: 1,
                  background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
                  boxShadow: '0 4px 10px rgba(156, 39, 176, 0.25)',
                  '&:hover': {
                    boxShadow: '0 6px 15px rgba(156, 39, 176, 0.35)',
                  }
                }}
              >
                {refreshing ? '更新中...' : '運勢情報を更新する'}
              </Button>
            </Box>
          )}
          
          {/* AIアシスタント相談ボタン - タブに関わらず常に表示 */}
          <div className="animate-on-load">
            <AiConsultButton />
          </div>
        </>
      )}
    </Box>
  );
};

export default Fortune;