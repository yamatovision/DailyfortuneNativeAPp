import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { ChatMode } from '../../../../shared';
import { chatService } from '../../services/chat.service';
import ChatModeSelector from './ChatModeSelector';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';
import MemberSelector from './MemberSelector';

// メッセージの型定義
export interface ChatMessageType {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// チャットコンポーネントのプロパティ
interface ChatContainerProps {
  initialMode?: ChatMode;
  onBack?: () => void;
  fullscreen?: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  // 運勢相談モードをデフォルトに戻す
  initialMode = ChatMode.PERSONAL,
  onBack,
  fullscreen = false
}) => {
  // 状態管理
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ChatMode>(initialMode);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showMemberSelector, setShowMemberSelector] = useState<boolean>(false);
  const [chatId, setChatId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初回ロード時にウェルカムメッセージを表示
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);
        
        console.log('チャット初期化開始 - モード:', mode);
        
        // モードが未設定・未定義の場合はデフォルトのモードに設定
        const chatMode = mode || ChatMode.PERSONAL;
        
        // モードを設定して初期メッセージを取得
        const response = await chatService.setMode(chatMode);
        
        // 初期メッセージ - AIからのウェルカムメッセージのみを表示
        setMessages([{
          role: 'assistant',
          content: response.welcomeMessage,
          timestamp: new Date().toISOString()
        }]);
        
        setChatId(response.chatHistory.id);
        console.log('チャット初期化完了:', { chatId: response.chatHistory.id, mode: chatMode });
      } catch (error: any) {
        console.error('Chat initialization error:', error);
        // エラーメッセージをより詳細に
        setError(error.message || 'チャットの初期化に失敗しました。');
        
        // エラー時はフォールバックとして運勢相談モードを試す
        if (mode !== ChatMode.PERSONAL) {
          console.log('フォールバック: 運勢相談モードで再試行');
          setMode(ChatMode.PERSONAL);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, [mode]); // モード変更時にも再初期化するように修正

  // メッセージリストの末尾に自動スクロール
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // モード変更ハンドラー
  const handleModeChange = async (newMode: ChatMode) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // チームメンバーモードの場合、メンバーセレクターを表示
      if (newMode === ChatMode.TEAM_MEMBER) {
        setShowMemberSelector(true);
        setMode(newMode);
        return;
      }
      
      // それ以外のモードの場合、APIを呼び出して切り替え
      const contextInfo = (newMode as string) === ChatMode.TEAM_MEMBER && selectedMemberId
        ? { memberId: selectedMemberId }
        : undefined;
      
      const response = await chatService.setMode(newMode, contextInfo);
      
      // AIからのウェルカムメッセージのみを表示
      setMessages([{
        role: 'assistant',
        content: response.welcomeMessage,
        timestamp: new Date().toISOString()
      }]);
      
      setChatId(response.chatHistory.id);
      setMode(newMode);
      setShowMemberSelector(false);
    } catch (error: any) {
      console.error('Mode change error:', error);
      setError(error.message || 'モードの変更に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // メンバー選択ハンドラー
  const handleMemberSelect = async (memberId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await chatService.setMode(ChatMode.TEAM_MEMBER, { memberId });
      
      // AIからのウェルカムメッセージのみを表示
      setMessages([{
        role: 'assistant',
        content: response.welcomeMessage,
        timestamp: new Date().toISOString()
      }]);
      
      setChatId(response.chatHistory.id);
      setSelectedMemberId(memberId);
      setShowMemberSelector(false);
    } catch (error: any) {
      console.error('Member selection error:', error);
      setError(error.message || 'メンバーの選択に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // ストリーミングコンテンツを保持するためのRef
  const streamContentRef = useRef('');
  
  // メッセージ送信ハンドラー
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    try {
      // ユーザーのメッセージをUIに表示しない（直接APIに送信するのみ）
      setIsLoading(true);
      setError(null);
      
      // APIを呼び出してAIレスポンスを取得
      const contextInfo = mode === ChatMode.TEAM_MEMBER && selectedMemberId
        ? { memberId: selectedMemberId }
        : undefined;
      
      // ストリーミング用の初期メッセージを作成
      const timestamp = new Date().toISOString();
      const aiMessage: ChatMessageType = {
        role: 'assistant',
        content: '',  // 空のコンテンツで初期化
        timestamp
      };
      
      // ストリーミング開始前にコンテンツをリセット
      streamContentRef.current = '';
      
      // メッセージリストに空のメッセージを追加
      setMessages(prev => [...prev, aiMessage]);
      
      // ストリーミングチャンク受信時のコールバックを設定
      chatService.setStreamChunkCallback((chunk) => {
        // チャンクをコンテンツ参照に追加
        streamContentRef.current += chunk;
        
        // 最新のメッセージを更新（レンダリングを最適化）
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            // 既存のメッセージに新しい完全な内容を設定
            lastMessage.content = streamContentRef.current;
          }
          return newMessages;
        });
      });
      
      // ストリーミングでメッセージを送信
      const response = await chatService.sendMessage(message, mode, contextInfo, true);
      
      // ストリーミングが完了したら、コールバックをクリア
      chatService.clearStreamChunkCallback();
      
      if (!chatId) {
        setChatId(response.chatHistory.id);
      }
    } catch (error: any) {
      console.error('Send message error:', error);
      setError(error.message || 'メッセージの送信に失敗しました。');
      // エラー時もコールバックをクリア
      chatService.clearStreamChunkCallback();
    } finally {
      setIsLoading(false);
    }
  };

  // チャット履歴クリアハンドラー
  const handleClearChat = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await chatService.clearHistory({ mode });
      
      // モードを再設定して新しいチャットを開始
      const response = await chatService.setMode(mode, 
        mode === ChatMode.TEAM_MEMBER && selectedMemberId 
          ? { memberId: selectedMemberId } 
          : undefined
      );
      
      // AIからのウェルカムメッセージのみを表示
      setMessages([{
        role: 'assistant',
        content: response.welcomeMessage,
        timestamp: new Date().toISOString()
      }]);
      
      setChatId(response.chatHistory.id);
    } catch (error: any) {
      console.error('Clear chat error:', error);
      setError(error.message || 'チャットのクリアに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        width: '100%',
        flex: 1,
        overflow: 'hidden',
        background: 'transparent',
        ...(fullscreen ? {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        } : {
          maxHeight: { xs: '100vh', md: '85vh' },
          borderRadius: { xs: 0, md: 2 },
          boxShadow: { xs: 'none', md: '0 3px 15px rgba(0,0,0,0.1)' },
          backgroundColor: 'white'
        })
      }}
    >
      {/* モードセレクター */}
      <ChatModeSelector 
        currentMode={mode} 
        onModeChange={handleModeChange}
        onBack={onBack}
        onClearChat={handleClearChat}
      />
      
      {/* メンバーセレクター（チームメンバーモード時のみ表示） */}
      {showMemberSelector && (
        <MemberSelector onMemberSelect={handleMemberSelect} />
      )}
      
      {/* エラーメッセージ */}
      {error && (
        <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}
      
      {/* メッセージリスト */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <ChatMessageList messages={messages} />
        <div ref={messagesEndRef} />
        
        {/* ローディングインジケーター */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
      
      {/* 入力フォーム */}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        disabled={isLoading || showMemberSelector}
      />
    </Box>
  );
};

export default ChatContainer;