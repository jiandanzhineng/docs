---
slug: shanbay-shock
title: Shanbay Vocabulary Shock Play Tutorial
sidebar_position: 12
---

## Why a Shock?

Why are games more stimulating than studying? Because there's a cost—you can't afford to lose, so you're fully focused and exhilarated with every move.

But what about memorizing vocabulary? You either "know" a word or you "don't know"—answering right or wrong feels uneventful. The brain thinks, "Whatever, next," and the words simply don't stick 😭

What if **you get a shock for a wrong answer**? Give "wrong" a tangible cost, and every word instantly becomes a life-or-death situation—that's the Shanbay Vocabulary Shock play: **Wrong answer → Shock → You'll definitely remember it next time** 🔌⚡

![Why Add Shock to Vocabulary Memorization ##h45vh##](./img/shanbay-shock/why-poster.png)

---

Shanbay Vocabulary Shock is a plugin play mode based on the Shanbay web version vocabulary study page: when the plugin detects that you clicked "Don't Know" (wrong answer), or—if punishment is enabled—detects "Couldn't Remember," it triggers the connected shock device to give you a zap ⚡.

> 🛒 **Get the device**: [Purchase on Taobao](https://item.taobao.com/item.htm?id=1065205279302) | [Purchase on Official Website](https://shop.undersilicon.cn/zh/products/beidanci) | [Claim Discount Coupon](../优惠券.md)  
> 🎬 **Video Tutorial**: [UnderSilicon Video Site (not yet uploaded)](https://video.undersilicon.com/w/pcesS2gYvbfuU5Wcf5v7fQ) | [YouTube (not yet uploaded)](https://youtu.be/Q7ti6oOdhpc)

<!-- TODO: The video tutorial currently uses the "寸止" gameplay video as a placeholder, will be replaced with a Shanbay Vocabulary Shock exclusive link. -->

## Gameplay Description

![Shanbay Vocabulary Shock Workflow Overview ##h45vh##](./img/shanbay-shock/workflow.png)

The whole closed-loop in one sentence: **Shanbay Answering → Plugin judges right/wrong → Wrong answer triggers shock device**—Painful memory, doubled efficiency.

## Steps

### 1. Preparation

Please install the client and connect the device first. For details, see [PC Control Client](./client/PC版控制客户端.md).

Before starting, double-check these:

- The control client is connected to a shock device (if not connected, you won't get shocked)
- At least one device with `shock` capability is available in the device mapping
- The browser can normally open the Shanbay web version vocabulary study page
- On first use, start with low intensity and short duration. Don't max it out right away ⚠️

### 2. Enter the Play Library

Find "Shanbay Vocabulary Shock" in the play library on the control panel.

![Shanbay Vocabulary Shock in the Play Library ##h45vh##](./img/shanbay-shock/01-play-library.png)

### 3. Open Pre-Launch Configuration

Click "Configure & Start" to enter the plugin configuration page.

![Pre-Launch Configuration Overview ##h45vh##](./img/shanbay-shock/02-config-overview.png)

### 4. Map the Shock Device

In "Device Mapping," select a device with `shock` capability. If none, go connect one first 😉

### 5. Set Parameters

Adjust the following parameters as needed:

- Shock Intensity (suggest starting low and gradually increasing)
- Shock Duration (similarly, start short, then increase)
- Whether "Couldn't Remember" also triggers punishment (option for the ruthless 💀)

![Parameter Configuration ##h45vh##](./img/shanbay-shock/03-params.png)

### 6. Launch the Plugin

Click "Launch Plugin" and confirm in the pop-up. Your last chance to chicken out!

![Plugin Launch Confirmation ##h45vh##](./img/shanbay-shock/05-start-confirm.png)

### 7. Begin Your Shock Learning Journey ⚡

The study page will first show the current word, phonetic transcription, and two answer options.

![Study Page Question ##h45vh##](./img/shanbay-shock/11-study-clean.png)

After a correct answer, it switches to the result state, indicating the word won't be studied again today. Congratulations, you've escaped 🎉

![Correct Answer Result ##h45vh##](./img/shanbay-shock/12-answer-result.png)

## Signal Rules

| Shanbay Page Signal | Plugin Judgment | Default Shock? |
| --- | --- | --- |
| `Know` | Correct | ❌ No shock (Good job) |
| `Don't Know` | Wrong | ⚡ Shock! |
| `Remembered` | Correct | ❌ No shock (Recall successful) |
| `Couldn't Remember` | Recall unsuccessful | By default lenient; with punishment enabled ⚡ |

## FAQs 🛠️

- **No shock triggered**: Check if the device mapping selected a `shock` device and confirm the plugin config page has no errors. Not getting shocked isn't a good thing here!
- **Triggers too often**: Turn off "Punish 'Couldn't Remember'" or reduce intensity and duration. Be kind to yourself 😅
- **Page not entering study state**: First ensure you're logged into your Shanbay web account and can start vocabulary learning normally.

## Tips 💡

- Verify your shock device is correctly mapped (Controller in hand, world at your command)
- Start with low intensity and short duration to find your personal "pain threshold"
- Stop the plugin before switching pages or exiting
- Give yourself a reward after finishing a set—after all, anyone who persists is a legend 💪⚡