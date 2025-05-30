import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

/**
 * チームモデルのインターフェース
 */
export interface ITeam {
  name: string;
  adminId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  description?: string;
  iconInitial?: string;
  iconColor?: 'primary' | 'water' | 'wood' | 'fire' | 'earth' | 'metal';
  administrators?: mongoose.Types.ObjectId[];
  inviteCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose用のドキュメントインターフェース
 */
export interface ITeamDocument extends ITeam, Document {}

/**
 * チームスキーマ定義
 */
const teamSchema = new Schema<ITeamDocument>(
  {
    name: {
      type: String,
      required: [true, 'チーム名は必須です'],
      trim: true,
      minlength: [2, 'チーム名は2文字以上である必要があります'],
      maxlength: [50, 'チーム名は50文字以下である必要があります']
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '管理者IDは必須です']
    },
    // チーム作成者を追加
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '作成者IDは必須です']
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, '組織IDは必須です']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'チームの説明は500文字以下である必要があります']
    },
    iconInitial: {
      type: String,
      maxlength: [2, 'アイコン文字は2文字以下である必要があります'],
      default: function(this: any) {
        return this.name ? this.name.charAt(0) : '';
      }
    },
    iconColor: {
      type: String,
      enum: {
        values: ['primary', 'water', 'wood', 'fire', 'earth', 'metal'],
        message: '{VALUE}は有効なアイコンカラーではありません'
      },
      default: 'primary'
    },
    // 管理者の配列追加（複数管理者をサポート）
    administrators: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    // 招待コード（チーム招待用の一意のコード）
    inviteCode: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(8).toString('hex')
    }
    // members フィールドは削除されました。
    // メンバーシップ管理は TeamMembership モデルを使用します。
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// インデックスの設定
teamSchema.index({ organizationId: 1 });
teamSchema.index({ adminId: 1 });
teamSchema.index({ creatorId: 1 });
teamSchema.index({ inviteCode: 1 }, { unique: true });
teamSchema.index({ name: 1, organizationId: 1 }, { unique: true });

/**
 * チームモデル
 */
export const Team = mongoose.model<ITeamDocument>('Team', teamSchema);