import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { app } from '../../config/firebase';
import jwtAuthService from './jwt-auth.service';
import tokenService from './token.service';
import apiService from '../api.service';
import storageService from '../storage/storage-factory';
import { AUTH, USER } from '@shared/index';

// 認証モード
export enum AuthMode {
  FIREBASE = 'firebase',
  JWT = 'jwt',
  HYBRID = 'hybrid',  // 移行期間中は両方の認証を試みる
}

// 認証管理サービスの型定義
export interface AuthManager {
  login(email: string, password: string): Promise<any>;
  register(email: string, password: string, displayName: string): Promise<any>;
  logout(): Promise<void>;
  getCurrentAuthMode(): AuthMode;
  setAuthMode(mode: AuthMode): Promise<void>;
  migrateToJwt(password: string): Promise<any>;
  refreshJwtTokenIfNeeded(): Promise<boolean>;
  isAuthenticated(): Promise<boolean>;
}

class AuthManagerService implements AuthManager {
  private auth = getAuth(app);
  // デフォルトはハイブリッドモード（移行期間中）
  private authMode: AuthMode = AuthMode.HYBRID;
  
  constructor() {
    // 認証モードの初期化
    this.initAuthMode();
  }
  
  // 認証モードの非同期初期化
  private async initAuthMode(): Promise<void> {
    try {
      // ストレージから認証モードを取得
      const savedMode = await storageService.get('df_auth_mode');
      if (savedMode && Object.values(AuthMode).includes(savedMode as AuthMode)) {
        this.authMode = savedMode as AuthMode;
      }
      console.log(`認証モード: ${this.authMode}`);
    } catch (error) {
      console.error('認証モード初期化エラー:', error);
      // デフォルトモードを使用
      console.log(`デフォルト認証モードを使用: ${this.authMode}`);
    }
  }
  
  // 現在の認証モードを取得
  getCurrentAuthMode(): AuthMode {
    return this.authMode;
  }
  
  // 認証モードを設定
  async setAuthMode(mode: AuthMode): Promise<void> {
    this.authMode = mode;
    try {
      // ストレージサービスを使用した非同期保存
      await storageService.set('df_auth_mode', mode);
      console.log(`認証モードを変更: ${mode}`);
    } catch (error) {
      console.error('認証モード保存エラー:', error);
    }
  }
  
  // ログイン処理（ハイブリッドまたは特定のモード）
  async login(email: string, password: string): Promise<any> {
    // JWT認証が優先
    if (this.authMode === AuthMode.JWT) {
      return this.jwtLogin(email, password);
    }
    
    // Firebase認証が優先
    if (this.authMode === AuthMode.FIREBASE) {
      return this.firebaseLogin(email, password);
    }
    
    // ハイブリッドモード（両方試す）
    try {
      // まずJWT認証を試みる
      console.log('JWT認証でログインを試みます');
      const jwtResult = await this.jwtLogin(email, password);
      // 成功した場合は結果を返す
      return jwtResult;
    } catch (jwtError) {
      console.warn('JWT認証に失敗、Firebase認証を試みます', jwtError);
      try {
        // JWT認証に失敗した場合はFirebase認証を試みる
        const firebaseResult = await this.firebaseLogin(email, password);
        return firebaseResult;
      } catch (firebaseError) {
        console.error('Firebase認証にも失敗しました', firebaseError);
        // 両方の認証に失敗した場合は最初のエラーを投げる
        throw jwtError;
      }
    }
  }
  
  // JWT認証でのログイン
  private async jwtLogin(email: string, password: string): Promise<any> {
    return jwtAuthService.login(email, password);
  }
  
  // Firebase認証でのログイン
  private async firebaseLogin(email: string, password: string): Promise<any> {
    try {
      // ログイン前に既存のキャッシュをクリア
      await apiService.clearCache();
      console.log('Firebase認証ログイン前にキャッシュをクリアしました');
      
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      // ユーザー情報をAPIから取得
      const profileResponse = await apiService.get(AUTH.PROFILE);
      
      if (profileResponse.status === 200) {
        return {
          user: profileResponse.data,
          firebaseUser: result.user
        };
      } else {
        throw new Error('ユーザープロフィール取得に失敗しました');
      }
    } catch (error) {
      console.error('Firebase認証ログインエラー:', error);
      throw error;
    }
  }
  
  // ユーザー登録処理
  async register(email: string, password: string, displayName: string): Promise<any> {
    // JWT認証が優先
    if (this.authMode === AuthMode.JWT) {
      return jwtAuthService.register(email, password, displayName);
    }
    
    // Firebase認証が優先
    if (this.authMode === AuthMode.FIREBASE) {
      return this.firebaseRegister(email, password, displayName);
    }
    
    // ハイブリッドモード（Firebase登録後、JWT認証に移行）
    try {
      // まずFirebaseでユーザーを作成（サーバー側がFirebase認証を前提としている可能性があるため）
      const firebaseResult = await this.firebaseRegister(email, password, displayName);
      
      // JWTへの移行を試みる
      try {
        const jwtMigrationResult = await jwtAuthService.migrateToJwt(password);
        console.log('ハイブリッドモード: Firebase登録とJWT移行が成功しました');
        return {
          ...firebaseResult,
          jwtTokens: jwtMigrationResult.tokens
        };
      } catch (jwtError) {
        console.warn('JWT移行に失敗しましたが、Firebase認証は成功しています', jwtError);
        return firebaseResult;
      }
    } catch (error) {
      console.error('ハイブリッドモードでのユーザー登録に失敗しました', error);
      throw error;
    }
  }
  
  // Firebase認証でのユーザー登録
  private async firebaseRegister(email: string, password: string, displayName: string): Promise<any> {
    try {
      // Firebaseでユーザー作成
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // サーバー側にユーザー情報を登録
      await apiService.post(AUTH.REGISTER, { displayName });
      
      // ユーザープロフィールを取得
      const profileResponse = await apiService.get(USER.GET_PROFILE);
      
      if (profileResponse.status === 200) {
        return {
          user: profileResponse.data,
          firebaseUser: result.user
        };
      } else {
        throw new Error('ユーザープロフィール取得に失敗しました');
      }
    } catch (error) {
      console.error('Firebase認証ユーザー登録エラー:', error);
      throw error;
    }
  }
  
  // ログアウト処理
  async logout(): Promise<void> {
    try {
      // JWTトークンの有無を確認
      const accessToken = await tokenService.getAccessToken();
      const isJwtAuth = this.authMode === AuthMode.JWT || 
                       (this.authMode === AuthMode.HYBRID && accessToken);
      
      const isFirebaseAuth = this.authMode === AuthMode.FIREBASE || 
                            (this.authMode === AuthMode.HYBRID && this.auth.currentUser);
      
      // 両方の認証からログアウト（ハイブリッドモード）
      const promises: Promise<void>[] = [];
      
      if (isJwtAuth) {
        console.log('JWTからログアウトします');
        promises.push(jwtAuthService.logout());
      } else {
        // JWTサービスを使用しない場合は、ここでキャッシュをクリア
        console.log('JWTサービスを使用せずにキャッシュをクリアします');
        promises.push(apiService.clearCache());
      }
      
      if (isFirebaseAuth) {
        console.log('Firebaseからログアウトします');
        promises.push(signOut(this.auth));
      }
      
      await Promise.all(promises);
      console.log('ログアウト完了（全認証システム）');
    } catch (error) {
      console.error('ログアウト処理中にエラーが発生しました', error);
      
      // エラーが発生してもローカルのトークンとキャッシュをクリア試行
      try {
        await apiService.clearCache();
        await tokenService.clearTokens();
        console.log('エラー後にトークンとキャッシュをクリアしました');
      } catch (clearError) {
        console.error('トークンとキャッシュのクリア中にエラーが発生しました', clearError);
      }
      
      throw error;
    }
  }
  
  // Firebase認証からJWTへの移行
  async migrateToJwt(password: string): Promise<any> {
    try {
      // Firebase認証が必要なエンドポイント
      const migrationResult = await jwtAuthService.migrateToJwt(password);
      
      // 移行が成功したら認証モードをJWTに変更
      if (migrationResult && migrationResult.tokens) {
        await this.setAuthMode(AuthMode.JWT);
      }
      
      return migrationResult;
    } catch (error) {
      console.error('JWT認証への移行に失敗しました', error);
      throw error;
    }
  }
  
  // 必要に応じてJWTトークンを更新
  async refreshJwtTokenIfNeeded(): Promise<boolean> {
    // JWTモードでない場合は何もしない
    if (this.authMode === AuthMode.FIREBASE) {
      return false;
    }
    
    try {
      // アクセストークンの残り時間を確認
      const remainingTime = await tokenService.getRemainingTime();
      
      // トークンがない場合は更新不可
      if (remainingTime === null) {
        console.log('アクセストークンが存在しないため更新をスキップします');
        return false;
      }
      
      // 残り5分以内ならトークンを更新
      const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5分（ミリ秒）
      
      if (remainingTime < REFRESH_THRESHOLD) {
        console.log(`アクセストークンの残り時間が少ないため更新します（残り${Math.floor(remainingTime / 1000)}秒）`);
        try {
          console.log('リフレッシュトークン更新プロセスを開始');
          const result = await jwtAuthService.refreshToken();
          
          if (result) {
            console.log('リフレッシュトークン更新に成功しました');
          } else {
            console.warn('リフレッシュトークン更新に失敗しました');
          }
          
          return result.success;
        } catch (error) {
          console.error('トークン更新エラー:', error);
          return false;
        }
      } else {
        // デバッグ用：残り時間を表示
        console.log(`アクセストークンの残り時間が十分あります（残り${Math.floor(remainingTime / 1000)}秒）`);
      }
      
      return true; // トークンは有効
    } catch (error) {
      console.error('トークン残り時間チェックエラー:', error);
      return false;
    }
  }
  
  // 認証状態を確認する
  async isAuthenticated(): Promise<boolean> {
    try {
      // 認証モードに応じた確認
      if (this.authMode === AuthMode.JWT) {
        // JWTの場合はトークンの有効性をチェック
        return await tokenService.isAccessTokenValid();
      } else if (this.authMode === AuthMode.FIREBASE) {
        // Firebaseの場合は現在のユーザーをチェック
        return !!this.auth.currentUser;
      } else {
        // ハイブリッドモードの場合は両方をチェック
        const jwtValid = await tokenService.isAccessTokenValid();
        const firebaseValid = !!this.auth.currentUser;
        
        return jwtValid || firebaseValid;
      }
    } catch (error) {
      console.error('認証状態確認エラー:', error);
      return false;
    }
  }
}

export default new AuthManagerService();