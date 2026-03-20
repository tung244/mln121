import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudioPlayer(src) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolumeState] = useState(1);
    const [playbackRate, setPlaybackRateState] = useState(1);

    const audioRef = useRef(null);
    const fadeIntervalRef = useRef(null);

    const clearFade = () => {
        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
        }
    };

    // Khởi tạo audio hoặc reset khi đổi src
    useEffect(() => {
        if (audioRef.current) {
            clearFade();
            audioRef.current.pause();
            audioRef.current.src = '';
        }

        if (!src) return;

        const audio = new Audio(src);
        audioRef.current = audio;
        audio.volume = volume;
        audio.playbackRate = playbackRate;

        const setAudioData = () => setDuration(audio.duration);
        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', handleEnded);

        setIsPlaying(false);
        setCurrentTime(0);

        return () => {
            clearFade();
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
            audio.src = '';
        };
    }, [src]);

    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            // Hiệu ứng Fade out nhẹ nhàng khi Pause (400ms)
            clearFade();
            const fadeStep = audio.volume / 20;
            fadeIntervalRef.current = setInterval(() => {
                if (audio.volume - fadeStep > 0) {
                    audio.volume -= fadeStep;
                } else {
                    audio.volume = 0;
                    audio.pause();
                    setIsPlaying(false);
                    audio.volume = volume; // Phục hồi volume cho lần play sau
                    clearFade();
                }
            }, 20); 
            setIsPlaying(false);
        } else {
            // Hiệu ứng Fade in nhẹ nhàng khi Play (400ms)
            clearFade();
            audio.volume = 0;
            audio.play().then(() => {
                setIsPlaying(true);
                const fadeStep = volume / 20;
                fadeIntervalRef.current = setInterval(() => {
                    if (audio.volume + fadeStep < volume) {
                        audio.volume += fadeStep;
                    } else {
                        audio.volume = volume;
                        clearFade();
                    }
                }, 20);
            }).catch((error) => {
                console.error("Lỗi phát audio (có thể do file không tồn tại hoặc sai đường dẫn):", error);
                alert("Không thể phát âm thanh! Vui lòng kiểm tra xem file audio đã có sẵn trong thư mục public/audio/ chưa.");
                // Reset lại UI
                audio.volume = volume;
                setIsPlaying(false);
            });
        }
    }, [isPlaying, volume]);

    const seek = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const setVolume = (newVolume) => {
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
        setVolumeState(newVolume);
    };

    const setPlaybackRate = (rate) => {
        if (audioRef.current) {
            audioRef.current.playbackRate = rate;
        }
        setPlaybackRateState(rate);
    };

    return {
        isPlaying,
        duration,
        currentTime,
        volume,
        playbackRate,
        togglePlay,
        seek,
        setVolume,
        setPlaybackRate
    };
}
