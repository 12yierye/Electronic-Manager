// oxlint-disable no-unused-vars
import { existsSync, mkdirSync, writeFileSync } from 'fs';

// 创建WAV文件的工具函数
function createWavFile(audioBuffer) {
    const length = audioBuffer.length;
    const numberOfChannels = audioBuffer.numberOfChannels || 1;
    const sampleRate = audioBuffer.sampleRate || 44100;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numberOfChannels * bitsPerSample / 8;
    const blockAlign = numberOfChannels * bitsPerSample / 8;
    const dataSize = length * numberOfChannels * bitsPerSample / 8;
    const fileSize = 36 + dataSize;
    
    const buffer = Buffer.alloc(44 + dataSize);
    
    // RIFF标识
    writeString(buffer, 0, 'RIFF');
    buffer.writeUInt32LE(fileSize, 4);
    writeString(buffer, 8, 'WAVE');
    
    // fmt子块
    writeString(buffer, 12, 'fmt ');
    buffer.writeUInt32LE(16, 16); // 子块大小
    buffer.writeUInt16LE(1, 20);  // 音频格式 (1 = PCM)
    buffer.writeUInt16LE(numberOfChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    
    // data子块
    writeString(buffer, 36, 'data');
    buffer.writeUInt32LE(dataSize, 40);
    
    // 写入音频数据
    const channelData = audioBuffer.getChannelData ? audioBuffer.getChannelData(0) : audioBuffer[0];
    let offset = 44;
    for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        buffer.writeInt16LE(Math.round(intSample), offset);
        offset += 2;
    }
    
    return buffer;
}

function writeString(buffer, offset, string) {
    for (let i = 0; i < string.length; i++) {
        buffer.writeUInt8(string.charCodeAt(i), offset + i);
    }
}

// 生成高优先级通知声音 (更清脆)
function generateHighPrioritySound() {
    const duration = 0.4; // 缩短持续时间使声音更清脆
    const sampleRate = 44100;
    const length = Math.ceil(duration * sampleRate);
    
    // 创建模拟的AudioBuffer对象
    const channelData = new Float32Array(length);
    
    // 生成更清脆的双音调提示音，使用正弦波叠加
    for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        // 使用更快的指数衰减创建清脆的提示音效果
        const envelope = Math.exp(-time * 8); // 更快的衰减速度
        
        // 创建两个和谐频率的组合：更高的频率使声音更清脆
        // 使用 880Hz (A5) 和 1100Hz (接近C#6/D♭6) 
        const wave1 = Math.sin(2 * Math.PI * 880 * time);
        const wave2 = Math.sin(2 * Math.PI * 1100 * time);
        
        // 混合两个波形并应用包络
        channelData[i] = (wave1 + wave2) * 0.5 * envelope;
    }
    
    // 返回模拟的AudioBuffer对象
    return {
        length: length,
        numberOfChannels: 1,
        sampleRate: sampleRate,
        getChannelData: function() { return channelData; },
        0: channelData  // 直接访问方式
    };
}

// 生成中优先级通知声音 (清脆、清晰)
function generateMediumPrioritySound() {
    const duration = 0.3; // 缩短持续时间使声音更清脆
    const sampleRate = 44100;
    const length = Math.ceil(duration * sampleRate);
    
    // 创建模拟的AudioBuffer对象
    const channelData = new Float32Array(length);
    
    // 生成单音调但更清脆的提示音
    for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        // 使用更快的指数衰减创建清脆的提示音效果
        const envelope = Math.exp(-time * 10); // 更快的衰减速度
        
        // 使用880Hz (A5) 频率，这是一个较高的音调，听起来更清脆
        const wave = Math.sin(2 * Math.PI * 880 * time);
        
        // 应用包络并适度降低音量避免过于响亮
        channelData[i] = wave * envelope * 0.7;
    }
    
    // 返回模拟的AudioBuffer对象
    return {
        length: length,
        numberOfChannels: 1,
        sampleRate: sampleRate,
        getChannelData: function() { return channelData; },
        0: channelData  // 直接访问方式
    };
}

// 生成低优先级通知声音 (相对清脆但仍柔和)
function generateLowPrioritySound() {
    const duration = 0.5; // 缩短持续时间使声音更清脆
    const sampleRate = 44100;
    const length = Math.ceil(duration * sampleRate);
    
    // 创建模拟的AudioBuffer对象
    const channelData = new Float32Array(length);
    
    // 生成较清脆但仍柔和的声音，使用中等频率和较快的包络
    for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        // 创建较快的包络，营造清脆的效果
        let envelope = 0;
        if (time < 0.1) {
            // 快速淡入
            envelope = time / 0.1;
        } else if (time < 0.4) {
            envelope = 1; // 保持峰值
        } else {
            // 快速淡出
            const fadeOutProgress = (time - 0.4) / 0.1;
            envelope = Math.max(0, 1 - fadeOutProgress);
        }
        
        // 使用中等频率(约550Hz)创造平衡感
        const frequency = 550;
        // 使用正弦波，这是最纯净、最清晰的波形
        const sineWave = Math.sin(2 * Math.PI * frequency * time);
        
        // 适度的音量让声音清晰但不过于强烈
        channelData[i] = sineWave * envelope * 0.6;
    }
    
    // 返回模拟的AudioBuffer对象
    return {
        length: length,
        numberOfChannels: 1,
        sampleRate: sampleRate,
        getChannelData: function() { return channelData; },
        0: channelData  // 直接访问方式
    };
}

// 生成电子风格高优先级通知声音 (现代、科技感)
function generateElectronicHighPrioritySound() {
    const duration = 0.5;
    const sampleRate = 44100;
    const length = Math.ceil(duration * sampleRate);
    
    // 创建模拟的AudioBuffer对象
    const channelData = new Float32Array(length);
    
    // 生成具有科技感的声音，使用方波和谐波
    for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        // 创建一个快速衰减的包络
        const envelope = (time < 0.1) ? time/0.1 : Math.exp(-(time-0.1) * 8);
        
        // 基频 (较高频率产生科技感)
        const fundamental = 1000;
        
        // 生成方波 (奇次谐波)
        let squareWave = 0;
        for (let harmonic = 1; harmonic <= 7; harmonic += 2) {
            squareWave += Math.sin(2 * Math.PI * fundamental * harmonic * time) / harmonic;
        }
        
        // 添加一些高频成分增强科技感
        const highFreq = 2000 + 1000 * Math.sin(2 * Math.PI * 5 * time); // 频率调制
        const modulator = Math.sin(2 * Math.PI * highFreq * time);
        
        // 混合方波和调制波
        channelData[i] = (squareWave * 0.7 + modulator * 0.3) * envelope;
    }
    
    // 返回模拟的AudioBuffer对象
    return {
        length: length,
        numberOfChannels: 1,
        sampleRate: sampleRate,
        getChannelData: function() { return channelData; },
        0: channelData  // 直接访问方式
    };
}

// 生成电子风格中优先级通知声音 (清晰、数字感)
function generateElectronicMediumPrioritySound() {
    const duration = 0.3;
    const sampleRate = 44100;
    const length = Math.ceil(duration * sampleRate);
    
    // 创建模拟的AudioBuffer对象
    const channelData = new Float32Array(length);
    
    // 生成具有数字感的声音
    for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        // 创建一个快速衰减的包络
        const envelope = (time < 0.05) ? time/0.05 : Math.exp(-(time-0.05) * 15);
        
        // 使用锯齿波创造数字感
        const fundamental = 800;
        const sawtooth = 2 * ((fundamental * time) % 1) - 1;
        
        // 添加谐波丰富频谱
        let wave = sawtooth;
        for (let harmonic = 2; harmonic <= 5; harmonic++) {
            const harmonicSaw = 2 * ((fundamental * harmonic * time) % 1) - 1;
            wave += harmonicSaw / (harmonic * 1.5);
        }
        
        channelData[i] = wave * envelope * 0.7;
    }
    
    // 返回模拟的AudioBuffer对象
    return {
        length: length,
        numberOfChannels: 1,
        sampleRate: sampleRate,
        getChannelData: function() { return channelData; },
        0: channelData  // 直接访问方式
    };
}

// 生成电子风格低优先级通知声音 (微妙、不打扰)
function generateElectronicLowPrioritySound() {
    const duration = 0.2;
    const sampleRate = 44100;
    const length = Math.ceil(duration * sampleRate);
    
    // 创建模拟的AudioBuffer对象
    const channelData = new Float32Array(length);
    
    // 生成微妙的电子声音
    for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        // 创建一个非常快速的衰减包络
        const envelope = (time < 0.05) ? time/0.05 : Math.exp(-(time-0.05) * 20);
        
        // 使用脉冲波创造数字点击声
        const frequency = 600;
        const pulseWidth = 0.1 + 0.1 * Math.sin(2 * Math.PI * 3 * time); // 动态脉冲宽度
        const phase = (frequency * time) % 1;
        const pulseWave = (phase < pulseWidth) ? 1 : -1;
        
        // 添加一些高频噪声增强电子感
        const noise = (Math.random() * 2 - 1) * 0.1;
        
        channelData[i] = (pulseWave + noise) * envelope * 0.5;
    }
    
    // 返回模拟的AudioBuffer对象
    return {
        length: length,
        numberOfChannels: 1,
        sampleRate: sampleRate,
        getChannelData: function() { return channelData; },
        0: channelData  // 直接访问方式
    };
}

// 生成自然风格高优先级通知声音 (有机、温暖)
function generateNaturalHighPrioritySound() {
    const duration = 1.0;
    const sampleRate = 44100;
    const length = Math.ceil(duration * sampleRate);
    
    // 创建模拟的AudioBuffer对象
    const channelData = new Float32Array(length);
    
    // 生成温暖的有机声音
    for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        
        // 创建一个平滑的包络，模拟自然声音的渐进
        let envelope = 0;
        if (time < 0.2) {
            envelope = time / 0.2; // 渐入
        } else if (time < 0.8) {
            envelope = 1; // 保持
        } else {
            envelope = 1 - (time - 0.8) / 0.2; // 渐出
        }
        
        // 模拟鸟鸣声，使用调频合成
        const carrierFreq = 1200;
        const modulatorFreq = 5;
        const modulationDepth = 200;
        
        const modulator = Math.sin(2 * Math.PI * modulatorFreq * time);
        const instantaneousFreq = carrierFreq + modulationDepth * modulator;
        const wave = Math.sin(2 * Math.PI * instantaneousFreq * time);
        
        // 添加温暖的低频成分
        const lowFreq = 300;
        const lowWave = Math.sin(2 * Math.PI * lowFreq * time) * 0.3;
        
        channelData[i] = (wave + lowWave) * envelope * 0.6;
    }
    
    // 返回模拟的AudioBuffer对象
    return {
        length: length,
        numberOfChannels: 1,
        sampleRate: sampleRate,
        getChannelData: function() { return channelData; },
        0: channelData  // 直接访问方式
    };
}

// 生成自然风格中优先级通知声音 (平静、舒缓)
function generateNaturalMediumPrioritySound() {
    const duration = 1.2;
    const sampleRate = 44100;
    const length = Math.ceil(duration * sampleRate);
    
    // 创建模拟的AudioBuffer对象
    const channelData = new Float32Array(length);
    
    // 生成平静的自然声音
    for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        
        // 创建一个平滑的包络
        let envelope = 0;
        if (time < 0.3) {
            envelope = time / 0.3; // 渐入
        } else if (time < 0.9) {
            envelope = 1; // 保持
        } else {
            envelope = 1 - (time - 0.9) / 0.3; // 渐出
        }
        
        // 模拟水滴声，使用正弦波加轻微的噪声
        const frequency = 600 + 100 * Math.sin(2 * Math.PI * 0.5 * time); // 轻微频率变化
        const wave = Math.sin(2 * Math.PI * frequency * time);
        
        // 添加轻微的随机变化使声音更自然
        const variation = (Math.random() * 2 - 1) * 0.05;
        
        channelData[i] = (wave + variation) * envelope * 0.5;
    }
    
    // 返回模拟的AudioBuffer对象
    return {
        length: length,
        numberOfChannels: 1,
        sampleRate: sampleRate,
        getChannelData: function() { return channelData; },
        0: channelData  // 直接访问方式
    };
}

// 生成自然风格低优先级通知声音 (极柔和、环境音)
function generateNaturalLowPrioritySound() {
    const duration = 1.5;
    const sampleRate = 44100;
    const length = Math.ceil(duration * sampleRate);
    
    // 创建模拟的AudioBuffer对象
    const channelData = new Float32Array(length);
    
    // 生成极柔和的环境声音
    for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        
        // 创建一个非常平滑的包络
        let envelope = 0;
        if (time < 0.5) {
            envelope = time / 0.5; // 渐入
        } else if (time < 1.0) {
            envelope = 1; // 保持
        } else {
            envelope = 1 - (time - 1.0) / 0.5; // 渐出
        }
        
        // 组合多种低频正弦波创造环境氛围
        const wave1 = Math.sin(2 * Math.PI * 200 * time) * 0.5;
        const wave2 = Math.sin(2 * Math.PI * 320 * time) * 0.3;
        const wave3 = Math.sin(2 * Math.PI * 150 * time) * 0.2;
        
        // 添加微量的白噪声创造真实感
        const noise = (Math.random() * 2 - 1) * 0.05;
        
        channelData[i] = (wave1 + wave2 + wave3 + noise) * envelope * 0.4;
    }
    
    // 返回模拟的AudioBuffer对象
    return {
        length: length,
        numberOfChannels: 1,
        sampleRate: sampleRate,
        getChannelData: function() { return channelData; },
        0: channelData  // 直接访问方式
    };
}

// 生成柔和风格高优先级通知声音 (更柔和、温暖)
function generateSoftHighPrioritySound() {
    const duration = 0.6; // 比默认音效稍长
    const sampleRate = 44100;
    const length = Math.ceil(duration * sampleRate);
    
    // 创建模拟的AudioBuffer对象
    const channelData = new Float32Array(length);
    
    // 生成柔和的双音调提示音，使用正弦波叠加
    for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        // 使用较慢的指数衰减创建柔和的提示音效果
        const envelope = Math.exp(-time * 4); // 比默认音效更慢的衰减速度
        
        // 创建两个和谐频率的组合：较低的频率使声音更柔和
        // 使用 440Hz (A4) 和 550Hz (接近C#5/D♭5) 
        const wave1 = Math.sin(2 * Math.PI * 440 * time);
        const wave2 = Math.sin(2 * Math.PI * 550 * time);
        
        // 混合两个波形并应用包络
        channelData[i] = (wave1 + wave2) * 0.5 * envelope;
    }
    
    // 返回模拟的AudioBuffer对象
    return {
        length: length,
        numberOfChannels: 1,
        sampleRate: sampleRate,
        getChannelData: function() { return channelData; },
        0: channelData  // 直接访问方式
    };
}

// 生成柔和风格中优先级通知声音 (柔和、平静)
function generateSoftMediumPrioritySound() {
    const duration = 0.5; // 比默认音效稍长
    const sampleRate = 44100;
    const length = Math.ceil(duration * sampleRate);
    
    // 创建模拟的AudioBuffer对象
    const channelData = new Float32Array(length);
    
    // 生成单音调但更柔和的提示音
    for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        // 使用较慢的指数衰减创建柔和的提示音效果
        const envelope = Math.exp(-time * 6); // 比默认音效更慢的衰减速度
        
        // 使用440Hz (A4) 频率，这是一个中等偏低的音调，听起来更柔和
        const wave = Math.sin(2 * Math.PI * 440 * time);
        
        // 应用包络并适度降低音量避免过于响亮
        channelData[i] = wave * envelope * 0.6;
    }
    
    // 返回模拟的AudioBuffer对象
    return {
        length: length,
        numberOfChannels: 1,
        sampleRate: sampleRate,
        getChannelData: function() { return channelData; },
        0: channelData  // 直接访问方式
    };
}

// 生成柔和风格低优先级通知声音 (非常柔和、温和)
function generateSoftLowPrioritySound() {
    const duration = 0.7; // 比默认音效稍长
    const sampleRate = 44100;
    const length = Math.ceil(duration * sampleRate);
    
    // 创建模拟的AudioBuffer对象
    const channelData = new Float32Array(length);
    
    // 生成非常柔和的声音，使用较低频率和较慢的包络
    for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        // 创建较慢的包络，营造柔和的效果
        let envelope = 0;
        if (time < 0.15) {
            // 慢速淡入
            envelope = time / 0.15;
        } else if (time < 0.5) {
            envelope = 1; // 保持峰值
        } else {
            // 慢速淡出
            const fadeOutProgress = (time - 0.5) / 0.2;
            envelope = Math.max(0, 1 - fadeOutProgress);
        }
        
        // 使用较低频率(约330Hz)创造柔和感
        const frequency = 330;
        // 使用正弦波，这是最纯净、最清晰的波形
        const sineWave = Math.sin(2 * Math.PI * frequency * time);
        
        // 适度的音量让声音清晰但不过于强烈
        channelData[i] = sineWave * envelope * 0.5;
    }
    
    // 返回模拟的AudioBuffer对象
    return {
        length: length,
        numberOfChannels: 1,
        sampleRate: sampleRate,
        getChannelData: function() { return channelData; },
        0: channelData  // 直接访问方式
    };
}

// 确保目录存在
if (!existsSync('res/sounds/default')) {
    mkdirSync('res/sounds/default', { recursive: true });
}

if (!existsSync('res/sounds/electronic')) {
    mkdirSync('res/sounds/electronic', { recursive: true });
}

if (!existsSync('res/sounds/natural')) {
    mkdirSync('res/sounds/natural', { recursive: true });
}

if (!existsSync('res/sounds/soft')) {
    mkdirSync('res/sounds/soft', { recursive: true });
}

// 生成默认风格的三种不同优先级的声音文件
console.log('正在生成高优先级通知声音...');
const highPrioritySoundBuffer = createWavFile(generateHighPrioritySound());
writeFileSync('res/sounds/default/high_priority.wav', highPrioritySoundBuffer);
console.log('已生成 res/sounds/default/high_priority.wav');

console.log('正在生成中优先级通知声音...');
const mediumPrioritySoundBuffer = createWavFile(generateMediumPrioritySound());
writeFileSync('res/sounds/default/medium_priority.wav', mediumPrioritySoundBuffer);
console.log('已生成 res/sounds/default/medium_priority.wav');

console.log('正在生成低优先级通知声音...');
const lowPrioritySoundBuffer = createWavFile(generateLowPrioritySound());
writeFileSync('res/sounds/default/low_priority.wav', lowPrioritySoundBuffer);
console.log('已生成 res/sounds/default/low_priority.wav');

// 生成柔和风格的三种不同优先级的声音文件
console.log('正在生成柔和风格高优先级通知声音...');
const softHighPrioritySoundBuffer = createWavFile(generateSoftHighPrioritySound());
writeFileSync('res/sounds/soft/high_priority.wav', softHighPrioritySoundBuffer);
console.log('已生成 res/sounds/soft/high_priority.wav');

console.log('正在生成柔和风格中优先级通知声音...');
const softMediumPrioritySoundBuffer = createWavFile(generateSoftMediumPrioritySound());
writeFileSync('res/sounds/soft/medium_priority.wav', softMediumPrioritySoundBuffer);
console.log('已生成 res/sounds/soft/medium_priority.wav');

console.log('正在生成柔和风格低优先级通知声音...');
const softLowPrioritySoundBuffer = createWavFile(generateSoftLowPrioritySound());
writeFileSync('res/sounds/soft/low_priority.wav', softLowPrioritySoundBuffer);
console.log('已生成 res/sounds/soft/low_priority.wav');

// 生成电子风格的三种不同优先级的声音文件
console.log('正在生成电子风格高优先级通知声音...');
const electronicHighPrioritySoundBuffer = createWavFile(generateElectronicHighPrioritySound());
writeFileSync('res/sounds/electronic/high_priority.wav', electronicHighPrioritySoundBuffer);
console.log('已生成 res/sounds/electronic/high_priority.wav');

console.log('正在生成电子风格中优先级通知声音...');
const electronicMediumPrioritySoundBuffer = createWavFile(generateElectronicMediumPrioritySound());
writeFileSync('res/sounds/electronic/medium_priority.wav', electronicMediumPrioritySoundBuffer);
console.log('已生成 res/sounds/electronic/medium_priority.wav');

console.log('正在生成电子风格低优先级通知声音...');
const electronicLowPrioritySoundBuffer = createWavFile(generateElectronicLowPrioritySound());
writeFileSync('res/sounds/electronic/low_priority.wav', electronicLowPrioritySoundBuffer);
console.log('已生成 res/sounds/electronic/low_priority.wav');

// 生成自然风格的三种不同优先级的声音文件
console.log('正在生成自然风格高优先级通知声音...');
const naturalHighPrioritySoundBuffer = createWavFile(generateNaturalHighPrioritySound());
writeFileSync('res/sounds/natural/high_priority.wav', naturalHighPrioritySoundBuffer);
console.log('已生成 res/sounds/natural/high_priority.wav');

console.log('正在生成自然风格中优先级通知声音...');
const naturalMediumPrioritySoundBuffer = createWavFile(generateNaturalMediumPrioritySound());
writeFileSync('res/sounds/natural/medium_priority.wav', naturalMediumPrioritySoundBuffer);
console.log('已生成 res/sounds/natural/medium_priority.wav');

console.log('正在生成自然风格低优先级通知声音...');
const naturalLowPrioritySoundBuffer = createWavFile(generateNaturalLowPrioritySound());
writeFileSync('res/sounds/natural/low_priority.wav', naturalLowPrioritySoundBuffer);
console.log('已生成 res/sounds/natural/low_priority.wav');

console.log('所有四种风格的通知声音文件已成功生成！');