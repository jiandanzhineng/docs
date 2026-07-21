---
slug: osr6-control-plugin
title: OSR6制御プラグイン
---

# OSR6制御プラグイン

本プラグインにより、OSR6デバイスをSilicon基盤の制御端末に追加し、OSR6デバイスの制御を実現します。  
multifunplayerまたはXTPlayerを使用している他のOSRデバイス（OSR2、OSR3など）も本プラグインで使用可能です。

## 使用要件

1. Windows環境
3. OSR6デバイスがシリアルポートを介してPCに接続されていること（有線またはBluetooth接続可）
4. multifunplayerまたはXTPlayerでOSR6デバイスを制御可能な状態であること

## ダウンロード先

github：https://github.com/jiandanzhineng/osr6-controller/releases/

藍奏雲：https://wwaos.lanzouu.com/iCmtw3o8ni8f

## 使用方法

動画版チュートリアル：https://www.bilibili.com/video/BV1Z4PWzdEkB/

以下では、寸止めプレイを例として、OSR6プラグインの使用方法を説明します。

寸止めプレイの使用方法は [3段階寸止めプレイ紹介](../player/气压寸止玩法3阶段升级版说明.md) を参照してください。

OSR6はゲーム内で元の振動モジュールを置き換え、OSR6によって刺激効果を実現します。

1. multifunplayerを開く
2. UnderSilicon制御端末を開く
3. OSR6制御プラグインを開き、OSR6のポートを選択してサービスを開始する
4. multifunplayerでUDP出力方式を追加し、出力アドレスを127.0.0.1、ポートをOSR6制御プラグイン内の設定と一致させる
4. これでUnderSilicon制御端末にOSR6デバイスが表示され、寸止めゲームを開始できます
> ! 注意：ゲーム開始時には、OSR6デバイスを偏心モーターコントローラーとしてチェックを入れる必要があります。それ以外の場合、OSR6はゲームの指令を受信できません。

[購入リンク](../player/气压寸止玩法3阶段升级版说明.md#buy-link-info)