"use client";

import { useEffect, useState, useMemo } from "react";
import "./ImagesComp.css";
import { database, ref, onValue, set } from "@/app/firebase-int";

const imageSets = [
    [
        { src: '/stills/left1.png', alt: 'Left Image 1', endingSrc: '/stills/left1-ending.gif', audioSrc: '/stills/left1.mp3', endingAudioSrc: '/stills/left1-ending.mp3' },
        { src: '/stills/right1.png', alt: 'Right Image 1', endingSrc: '/stills/right1-ending.gif', audioSrc: '/stills/right1.mp3', endingAudioSrc: '/stills/right1-ending.mp3' }
    ],
    [
        { src: '/stills/left2.png', alt: 'Left Image 2', endingSrc: '/stills/left2-ending.gif', audioSrc: '/stills/left2.mp3', endingAudioSrc: '/stills/left2-ending.mp3' },
        { src: '/stills/right2.png', alt: 'Right Image 2', endingSrc: '/stills/right2-ending.gif', audioSrc: '/stills/right2.mp3', endingAudioSrc: '/stills/right2-ending.mp3' }
    ],
    [
        { src: '/stills/left3.png', alt: 'Left Image 3', endingSrc: '/stills/left3-ending.gif', audioSrc: '/stills/left3.mp3', endingAudioSrc: '/stills/left3-ending.mp3' },
        { src: '/stills/right3.png', alt: 'Right Image 3', endingSrc: '/stills/right3-ending.gif', audioSrc: '/stills/right3.mp3', endingAudioSrc: '/stills/right3-ending.mp3' }
    ]
];

const ImagesComp = () => {
    const [currentSetIndex, setCurrentSetIndex] = useState<number | null>(null);
    const [gifPlayingImage, setGifPlayingImage] = useState<string>("");
    const [playEndingVideo, setPlayEndingVideo] = useState<boolean>(false);
    const [isEndingVideoLoaded, setIsEndingVideoLoaded] = useState<boolean>(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [endingAudio, setEndingAudio] = useState<HTMLAudioElement | null>(null);
    const [preloadedEndingAudio, setPreloadedEndingAudio] = useState<{ [key: string]: HTMLAudioElement }>({});
    const [timer, setTimer] = useState<number | null>(null);

    const currentImageSet = useMemo(() => currentSetIndex !== null ? imageSets[currentSetIndex] : [], [currentSetIndex]);

    // Fetch and sync the current image set index and timer from Firebase
    useEffect(() => {
        const indexRef = ref(database, 'currentImageSetIndex');
        const timerRef = ref(database, 'timer');

        const onIndexChange = (snapshot: any) => {
            const data = snapshot.val();
            if (data !== null) {
                setCurrentSetIndex(data);
            } else {
                set(indexRef, 0);
            }
        };

        const onTimerChange = (snapshot: any) => {
            const data = snapshot.val();
            setTimer(data);
        };

        const unsubscribeIndex = onValue(indexRef, onIndexChange);
        const unsubscribeTimer = onValue(timerRef, onTimerChange);

        return () => {
            unsubscribeIndex(); // Clean up index listener
            unsubscribeTimer(); // Clean up timer listener
        };
    }, []);

    // Update the image set when the timer resets to 15 seconds
    useEffect(() => {
        const updateImageSetIndex = async () => {
            if (timer !== null && currentSetIndex !== null) {
                // Only update the image set index if the timer is at a 15-second mark
                if (timer % 15 === 0 && timer !== 0) {
                    const newIndex = (currentSetIndex + 1) % imageSets.length;
                    setCurrentSetIndex(newIndex);
                    setGifPlayingImage("");
                    setPlayEndingVideo(false);
                    setIsEndingVideoLoaded(false);

                    // Update the image set index in Firebase
                    const indexRef = ref(database, 'currentImageSetIndex');
                    await set(indexRef, newIndex);

                    // Stop any currently playing ending audio
                    if (endingAudio) {
                        endingAudio.pause();
                        endingAudio.currentTime = 0;
                    }
                }
            }
        };

        updateImageSetIndex();
    }, [timer]);

    // Preload audio for the current image set
    useEffect(() => {
        const preloadAudio = () => {
            const audioElements: { [key: string]: HTMLAudioElement } = {};
            currentImageSet.forEach(image => {
                if (image.endingAudioSrc) {
                    const audioElement = new Audio(image.endingAudioSrc);
                    audioElement.preload = 'auto';
                    audioElements[image.alt] = audioElement;
                }
            });
            setPreloadedEndingAudio(audioElements);
        };

        preloadAudio();

        // Clean up any existing audio
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
        if (endingAudio) {
            endingAudio.pause();
            endingAudio.currentTime = 0;
        }
    }, [currentSetIndex]);

    useEffect(() => {
        if (gifPlayingImage) {
            const img = new Image();
            const endingImage = currentImageSet.find(image => image.alt === gifPlayingImage)?.endingSrc || '';
            if (endingImage) {
                img.src = endingImage;
                img.onload = () => {
                    setIsEndingVideoLoaded(true);
                    setTimeout(() => setPlayEndingVideo(true), 2600); // Short delay to avoid flicker
                };
            }

            // Stop any currently playing audio
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }

            // Play audio for the current image
            const audioSrc = currentImageSet.find(image => image.alt === gifPlayingImage)?.audioSrc || '';
            if (audioSrc) {
                const newAudio = new Audio(audioSrc);
                newAudio.play();
                setAudio(newAudio);
            }
        } else if (audio) {
            // Stop the audio when no GIF is playing
            audio.pause();
            audio.currentTime = 0;
        }
    }, [gifPlayingImage, currentSetIndex]);

    useEffect(() => {
        // Handle audio for the ending GIF
        if (playEndingVideo) {
            const endingAudioSrc = currentImageSet.find(image => image.alt === gifPlayingImage)?.endingAudioSrc || '';
            if (endingAudioSrc) {
                const preloadedAudio = preloadedEndingAudio[gifPlayingImage];
                if (preloadedAudio) {
                    preloadedAudio.play();
                    setEndingAudio(preloadedAudio);
                } else {
                    const newEndingAudio = new Audio(endingAudioSrc);
                    newEndingAudio.play();
                    setEndingAudio(newEndingAudio);
                }
            }
        } else if (endingAudio) {
            // Stop the ending audio when not playing
            endingAudio.pause();
            endingAudio.currentTime = 0;
        }
    }, [playEndingVideo]);

    return (
        <div className={`imageContainer ${!!gifPlayingImage ? "resistClick" : ""}`}>
            {currentImageSet.map((image, index) => {
                const isPlayingGif = gifPlayingImage === image.alt;
                const imageSrc = isPlayingGif
                    ? (playEndingVideo && isEndingVideoLoaded ? image.endingSrc : image.src.slice(0, -3) + "gif")
                    : image.src;

                return (
                    imageSrc && (
                        <img
                            key={index}
                            src={imageSrc}
                            alt={image.alt}
                            style={{ width: '100%', height: 'auto' }}
                            onClick={() => setGifPlayingImage(image.alt)}
                            className={`image ${isPlayingGif ? 'hidden' : ''}`}
                        />
                    )
                );
            })}
        </div>
    );
};

export default ImagesComp;
