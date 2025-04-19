import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Gender, ExtendedLocation } from '@shared/index';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import ja from 'date-fns/locale/ja';
import { format } from 'date-fns';
import sajuProfileService, { GeoCoordinates } from '../../services/saju-profile.service';
import TimezoneSelector from './TimezoneSelector';
import LocationSelector from './LocationSelector';

interface SajuProfileFormProps {
  onSubmit: (profileData: any) => void;
  initialData?: {
    birthDate?: Date;
    birthTime?: string;
    birthPlace?: string;
    birthplaceCoordinates?: GeoCoordinates;
    localTimeOffset?: number;
    gender?: Gender;
    goal?: string;
    timeZone?: string;
    extendedLocation?: ExtendedLocation;
  };
  isLoading?: boolean;
}

const SajuProfileForm: React.FC<SajuProfileFormProps> = ({ onSubmit, initialData, isLoading }) => {
  // デフォルト値を設定
  const defaultDate = new Date(1990, 0, 1); // 1990-01-01
  const defaultTime = new Date();
  defaultTime.setHours(12);
  defaultTime.setMinutes(0);

  const [birthDate, setBirthDate] = useState<Date | null>(
    initialData?.birthDate ? new Date(initialData.birthDate) : defaultDate
  );
  
  const [birthTime, setBirthTime] = useState<Date | null>(
    initialData?.birthTime 
      ? (() => {
          const [hours, minutes] = initialData.birthTime.split(':').map(Number);
          const date = new Date();
          date.setHours(hours);
          date.setMinutes(minutes);
          return date;
        })() 
      : defaultTime
  );
  
  const [birthPlace, setBirthPlace] = useState(initialData?.birthPlace || '東京都');
  const [gender, setGender] = useState<string>(initialData?.gender || 'M');
  const [goal, setGoal] = useState<string>(initialData?.goal || '');
  const [birthplaceCoordinates, setBirthplaceCoordinates] = useState<GeoCoordinates | undefined>(
    initialData?.birthplaceCoordinates
  );
  
  // 国際対応拡張情報
  const [useInternationalMode, setUseInternationalMode] = useState<boolean>(!!initialData?.timeZone || false);
  const [timeZone, setTimeZone] = useState<string | null>(initialData?.timeZone || null);
  const [extendedLocation, setExtendedLocation] = useState<ExtendedLocation | null>(
    initialData?.extendedLocation || null
  );
  
  // 都市選択のための状態
  const [loadingCoordinates, setLoadingCoordinates] = useState(false);
  const [localTimeOffset, setLocalTimeOffset] = useState<number | null>(
    initialData?.localTimeOffset !== undefined ? initialData.localTimeOffset : null
  );
  
  const [errors, setErrors] = useState({
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    gender: '',
    coordinates: '',
    goal: '',
    timeZone: ''
  });

  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugMessage, setDebugMessage] = useState('');
  
  // 不要な都市リスト取得コードを削除（LocationSelectorが内部で行うため）

  // 都市名から座標を取得する関数
  const fetchCityCoordinates = async (cityName: string) => {
    if (!cityName) return;
    
    setLoadingCoordinates(true);
    try {
      if (useInternationalMode) {
        // 国際モードの場合はタイムゾーン情報も一緒に取得
        const tzInfo = await sajuProfileService.getTimezoneInfo(cityName);
        
        if (tzInfo.politicalTimeZone) {
          setTimeZone(tzInfo.politicalTimeZone);
        }
        
        // 拡張ロケーション情報を更新
        if (extendedLocation) {
          const updatedLocation: ExtendedLocation = {
            ...extendedLocation,
            name: cityName
          };
          
          // 座標情報が含まれていれば更新
          if ('coordinates' in tzInfo && tzInfo.coordinates && 
              typeof tzInfo.coordinates === 'object' && 
              'longitude' in tzInfo.coordinates && 
              'latitude' in tzInfo.coordinates) {
            const coordinates = {
              longitude: Number(tzInfo.coordinates.longitude),
              latitude: Number(tzInfo.coordinates.latitude)
            };
            updatedLocation.coordinates = coordinates;
            setBirthplaceCoordinates(coordinates);
          }
          
          setExtendedLocation(updatedLocation);
          setErrors({...errors, coordinates: ''});
        } else {
          // 拡張ロケーション情報がない場合は新規作成
          const coords = await sajuProfileService.getCityCoordinates(cityName);
          if (coords) {
            const newLocation: ExtendedLocation = {
              name: cityName,
              coordinates: coords,
              timeZone: tzInfo.politicalTimeZone
            };
            setExtendedLocation(newLocation);
            setBirthplaceCoordinates(coords);
            setErrors({...errors, coordinates: ''});
          }
        }
        
        // 地方時オフセットを設定
        if (tzInfo.adjustmentDetails) {
          setLocalTimeOffset(tzInfo.adjustmentDetails.totalAdjustmentMinutes);
        }
      } else {
        // 従来のモード
        const coordinates = await sajuProfileService.getCityCoordinates(cityName);
        if (coordinates) {
          setBirthplaceCoordinates(coordinates);
          setErrors({...errors, coordinates: ''});
          console.log(`${cityName}の座標を取得しました:`, coordinates);
          
          // 地方時オフセットを計算
          try {
            const offset = await sajuProfileService.calculateLocalTimeOffset(coordinates);
            setLocalTimeOffset(offset);
            console.log(`${cityName}の地方時オフセット: ${offset}分`);
          } catch (error) {
            console.error('地方時オフセットの計算に失敗しました:', error);
            setLocalTimeOffset(null);
          }
        } else {
          setErrors({...errors, coordinates: `${cityName}の座標情報が見つかりませんでした`});
          setBirthplaceCoordinates(undefined);
        }
      }
    } catch (error) {
      console.error(`${cityName}の座標取得に失敗しました:`, error);
      setErrors({...errors, coordinates: `${cityName}の座標取得に失敗しました`});
      setBirthplaceCoordinates(undefined);
    } finally {
      setLoadingCoordinates(false);
    }
  };
  
  // 手動入力時にも座標を取得
  useEffect(() => {
    if (birthPlace && birthPlace.trim() !== '') {
      // ユーザーが直接入力を変更した場合は少し遅延させて座標取得
      const timer = setTimeout(() => {
        // 2文字以上入力されていれば座標取得を試みる
        if (birthPlace.length >= 2) {
          fetchCityCoordinates(birthPlace);
        } else {
          // 条件を満たさない場合は座標をクリア
          setBirthplaceCoordinates(undefined);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [birthPlace]);

  const validateForm = () => {
    const newErrors = {
      birthDate: '',
      birthTime: '',
      birthPlace: '',
      gender: '',
      coordinates: '',
      timeZone: ''
    };
    
    if (!birthDate) newErrors.birthDate = '生年月日は必須です';
    if (!birthTime) newErrors.birthTime = '出生時間は必須です';
    if (!birthPlace) newErrors.birthPlace = '出生地は必須です';
    if (!gender) newErrors.gender = '性別は必須です';
    
    // 国際モードの場合はタイムゾーンのバリデーション
    if (useInternationalMode && !timeZone) {
      newErrors.timeZone = 'タイムゾーンを選択してください';
    }
    
    // 座標があるかチェック（座標はオプションだが、精度向上のために推奨）
    if (!birthplaceCoordinates && birthPlace) {
      console.log(`座標情報なしで送信: ${birthPlace}`);
      // エラーではないが、デバッグ情報を記録
      setDebugMessage(`注意: ${birthPlace}の座標情報がないため、地方時補正なしで計算されます`);
      setShowDebugInfo(true);
    }
    
    setErrors({ ...newErrors, goal: '' });
    
    // デバッグ情報
    const timeString = birthTime ? format(birthTime, 'HH:mm') : 'なし';
    const coordinatesString = birthplaceCoordinates 
      ? `経度=${birthplaceCoordinates.longitude.toFixed(4)}, 緯度=${birthplaceCoordinates.latitude.toFixed(4)}`
      : 'なし';
    
    // ローカル日付文字列を取得（タイムゾーン問題解決のため）
    const formatLocalDebugDate = (date: Date | null): string => {
      if (!date) return 'なし';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    let debugInfo = `送信データ: 日付=${formatLocalDebugDate(birthDate)}, 時間=${timeString}, 場所=${birthPlace}, 性別=${gender}, 座標=${coordinatesString}`;
    
    if (useInternationalMode) {
      debugInfo += `, タイムゾーン=${timeZone || 'なし'}`;
    }
      
    setDebugMessage(debugInfo);
    setShowDebugInfo(true);
    
    return !Object.values(newErrors).some(error => error !== '');
  };

  // 親コンポーネントから呼び出される送信関数
  const handleSubmitAction = () => {
    // フォーム送信の詳細なデバッグログ
    console.group('🧩 SajuProfileForm - フォーム送信');
    // タイムゾーン問題解決のため、日付をローカル文字列で表示
    const localDateString = birthDate ? 
      `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}` 
      : null;
      
    console.log('フォームデータ (生):', { 
      birthDate: localDateString, 
      birthTime: birthTime ? format(birthTime, 'HH:mm') : null, 
      birthPlace, 
      gender, 
      birthplaceCoordinates,
      localTimeOffset,
      timeZone,
      extendedLocation,
      useInternationalMode
    });
    
    // バリデーションチェック
    if (!validateForm()) {
      console.error("バリデーションエラー:", errors);
      console.groupEnd();
      return;
    }
    
    // 時間フォーマット
    const formattedTime = birthTime ? format(birthTime, 'HH:mm') : '12:00';
    
    // 送信用データの構築
    // タイムゾーン問題を解消するためにローカル日付文字列を使用
    const formatLocalDate = (date: Date | null): string => {
      if (!date) return defaultDate.toISOString().split('T')[0];
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // 基本データを定義
    const profileData: any = {
      birthDate: formatLocalDate(birthDate),
      birthTime: formattedTime,
      birthPlace: birthPlace || '東京都',
      gender: gender || 'M',
      birthplaceCoordinates: birthplaceCoordinates,
      localTimeOffset: localTimeOffset !== null ? localTimeOffset : undefined,
      goal: goal
    };
    
    // 国際モードが有効な場合は追加データを設定
    if (useInternationalMode) {
      profileData.timeZone = timeZone || undefined;
      profileData.extendedLocation = extendedLocation || undefined;
    }
    
    // デバッグログの強化
    try {
      // 日付変換のチェック
      const parsedBirthDate = new Date(profileData.birthDate);
      if (isNaN(parsedBirthDate.getTime())) {
        console.error('警告: 日付変換に失敗しました。形式を確認してください:', profileData.birthDate);
      } else {
        console.log('日付変換成功:', parsedBirthDate.toISOString());
      }
      
      // 時間フォーマットチェック
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(profileData.birthTime)) {
        console.error('警告: 時間形式が無効です:', profileData.birthTime);
      } else {
        console.log('時間形式が有効です');
      }
      
      // 座標情報の検証
      if (profileData.birthplaceCoordinates) {
        const { longitude, latitude } = profileData.birthplaceCoordinates;
        if (typeof longitude !== 'number' || typeof latitude !== 'number' ||
            longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
          console.error('警告: 座標値が無効です:', profileData.birthplaceCoordinates);
        } else {
          console.log('座標値が有効です');
        }
      } else {
        console.warn('座標情報がありません - サーバーサイドでの計算に依存します');
      }
      
      console.log('最終的な送信データ:', JSON.stringify(profileData, null, 2));
      console.log('親コンポーネントのonSubmitメソッドを呼び出します');
      console.groupEnd();
      
      // 送信データの実際のJSONデータとしての形式をチェック
      try {
        JSON.stringify(profileData);
        console.log('JSON検証: 有効なJSONオブジェクトです');
      } catch (jsonError) {
        console.error('JSON検証エラー: 無効なJSONデータです', jsonError);
      }
      
      // 親コンポーネントのコールバックを呼び出し
      onSubmit(profileData);
    } catch (err) {
      console.error('送信前のデータ処理でエラーが発生しました:', err);
      console.groupEnd();
    }
  };

  return (
    <Card elevation={3} sx={{ 
      mb: 3, 
      borderRadius: 3,
      background: 'white',
      boxShadow: '0 4px 20px rgba(156, 39, 176, 0.15)',
    }}>
      <CardContent>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2,
            color: 'primary.dark',
            borderBottom: '1px solid',
            borderColor: 'primary.light',
            pb: 1
          }}
        >
          四柱推命プロフィール情報
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          四柱推命の計算に必要な情報です。正確な情報を入力してください。
        </Typography>
        
        <Box sx={{ width: '100%' }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="生年月日"
                  value={birthDate}
                  onChange={(newValue) => setBirthDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.birthDate,
                      helperText: errors.birthDate,
                      required: true,
                    }
                  }}
                  disableFuture
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TimePicker
                  label="出生時間"
                  value={birthTime}
                  onChange={(newValue) => setBirthTime(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.birthTime,
                      helperText: errors.birthTime || 'HH:MM形式 (24時間表記)',
                      required: true,
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={!!errors.gender} required>
                  <InputLabel id="gender-label">性別</InputLabel>
                  <Select
                    labelId="gender-label"
                    value={gender}
                    label="性別"
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <MenuItem value="M">男性</MenuItem>
                    <MenuItem value="F">女性</MenuItem>
                  </Select>
                  {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 1, 
                  bgcolor: useInternationalMode ? 'info.50' : 'grey.50',
                  border: '1px solid',
                  borderColor: useInternationalMode ? 'info.200' : 'grey.300'
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useInternationalMode}
                        onChange={(e) => setUseInternationalMode(e.target.checked)}
                        color="info"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={useInternationalMode ? 600 : 400} color={useInternationalMode ? "info.main" : "text.secondary"}>
                          海外出生の詳細設定
                        </Typography>
                        <Typography variant="caption" color={useInternationalMode ? "info.dark" : "text.secondary"}>
                          {useInternationalMode ? "海外出生詳細モードが有効です" : "海外で生まれた場合はこの設定を有効にしてください"}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                {/* 新しいLocationSelectorを使用 */}
                <LocationSelector
                  value={birthPlace}
                  onChange={(newLocation, locationInfo) => {
                    if (newLocation) {
                      setBirthPlace(newLocation);
                      
                      // 時差調整値を設定
                      if (locationInfo) {
                        setLocalTimeOffset(locationInfo.adjustment);
                        
                        // 海外の場合とそれ以外で処理を分ける
                        if (locationInfo.isOverseas) {
                          // 海外の場合はタイムゾーン情報を更新
                          if (useInternationalMode) {
                            setExtendedLocation({
                              name: newLocation,
                              coordinates: { longitude: 0, latitude: 0 }, // 仮の座標
                              timeZone: timeZone || 'UTC' // デフォルトUTC
                            });
                          }
                          setBirthplaceCoordinates(undefined);
                        } else {
                          // 国内の場合は仮の座標情報を設定（都道府県の代表点）
                          // 実際の計算ではSimplifiedTimeZoneManagerの調整値が使われる
                          // このコードは互換性のために座標を設定しているだけ
                          let defaultCoords;
                          switch(newLocation) {
                            case '北海道': defaultCoords = { longitude: 141.3469, latitude: 43.0642 }; break;
                            case '東京都': defaultCoords = { longitude: 139.6917, latitude: 35.6895 }; break;
                            case '大阪府': defaultCoords = { longitude: 135.5023, latitude: 34.6937 }; break;
                            case '福岡県': defaultCoords = { longitude: 130.4017, latitude: 33.6068 }; break;
                            default: defaultCoords = { longitude: 139.6917, latitude: 35.6895 }; // デフォルト東京
                          }
                          
                          setBirthplaceCoordinates(defaultCoords);
                          
                          if (useInternationalMode) {
                            setExtendedLocation({
                              name: newLocation,
                              coordinates: defaultCoords,
                              timeZone: 'Asia/Tokyo'
                            });
                          }
                        }
                        
                        // エラーをクリア
                        setErrors({...errors, coordinates: '', birthPlace: ''});
                      }
                    }
                  }}
                  error={errors.birthPlace || errors.coordinates}
                />
                
                {/* 海外出生の詳細設定が有効な場合のみタイムゾーン選択を表示 */}
                {useInternationalMode && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 1.5, 
                    borderRadius: 1, 
                    bgcolor: 'info.50', 
                    border: '1px solid',
                    borderColor: 'info.200'
                  }}>
                    <Typography 
                      variant="body2" 
                      fontWeight={600} 
                      color="info.main" 
                      sx={{ mb: 1 }}
                    >
                      海外出生の詳細設定
                    </Typography>
                    
                    <TimezoneSelector
                      value={timeZone}
                      onChange={(newTimeZone) => setTimeZone(newTimeZone)}
                      error={errors.timeZone}
                    />
                    
                    <Alert severity="info" sx={{ mt: 1, p: 0.5, fontSize: '0.75rem' }}>
                      海外出生の場合は現地時間をそのまま入力してください。タイムゾーンは記録用です。
                    </Alert>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12}>
                {loadingCoordinates ? (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      座標情報を取得中...
                    </Typography>
                  </Box>
                ) : birthplaceCoordinates ? (
                  <Box sx={{ mt: 1, p: 1, borderRadius: 1, bgcolor: 'background.paper', border: '1px dashed', borderColor: 'primary.light' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOnIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />
                      <Typography variant="caption" fontWeight="bold" color="primary.main">
                        座標情報
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', pl: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        経度: {birthplaceCoordinates.longitude.toFixed(4)}° {birthplaceCoordinates.longitude >= 0 ? '東経' : '西経'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        緯度: {birthplaceCoordinates.latitude.toFixed(4)}° {birthplaceCoordinates.latitude >= 0 ? '北緯' : '南緯'}
                      </Typography>
                      
                      {localTimeOffset !== null && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            mt: 0.5, 
                            color: 'info.main', 
                            bgcolor: 'rgba(3, 169, 244, 0.1)', 
                            px: 1, 
                            py: 0.2, 
                            borderRadius: 1, 
                            display: 'inline-flex', 
                            alignItems: 'center',
                            alignSelf: 'flex-start'
                          }}
                        >
                          <span style={{ fontWeight: 'bold', marginRight: '4px' }}>地方時調整:</span> 
                          {localTimeOffset > 0 ? '+' : ''}{localTimeOffset}分
                        </Typography>
                      )}
                      
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.7rem', fontStyle: 'italic' }}>
                        ※ 座標情報は四柱推命の地方時計算に使用されます
                      </Typography>
                    </Box>
                  </Box>
                ) : null}
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="個人目標"
                  name="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  multiline
                  rows={3}
                  error={!!errors.goal}
                  helperText={errors.goal || "あなたの目標を設定してください。デイリー運勢と連携して、目標達成に役立つアドバイスが提供されます。"}
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    onClick={handleSubmitAction}
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                    sx={{ 
                      px: 4,
                      borderRadius: 30,
                      background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
                      boxShadow: '0 4px 10px rgba(156, 39, 176, 0.25)',
                      '&:hover': {
                        boxShadow: '0 6px 15px rgba(156, 39, 176, 0.35)',
                      }
                    }}
                  >
                    {isLoading ? '送信中...' : (initialData ? '更新する' : '送信する')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Box>
      </CardContent>
      
      <Snackbar
        open={showDebugInfo}
        autoHideDuration={6000}
        onClose={() => setShowDebugInfo(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowDebugInfo(false)} severity="info" sx={{ width: '100%' }}>
          {debugMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default SajuProfileForm;