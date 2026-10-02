/* =========================
   LIVE OPENING TIME
========================= */

function updateOpeningTime() {

    const timeElement =
        document.getElementById("market-time");

    if (!timeElement) return;

    const now = new Date();

    let hours =
        now.getHours();

    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    const period =
        hours >= 12
            ? "PM"
            : "AM";

    hours =
        hours % 12 || 12;

    timeElement.textContent =
        `${String(hours).padStart(2, "0")}:${minutes} ${period}`;

}

updateOpeningTime();


/* =========================
   ELEMENTS
========================= */

const skies =
    document.querySelectorAll(".sky");

const openingText =
    document.querySelector(".opening-text");
    const musicPrompt =
    document.getElementById("music-prompt");

const storyText =
    document.querySelector(".story-text");

const letterSections =
    document.querySelectorAll(".letter-section");

const photoScenes =
    document.querySelectorAll(".photo-scene");

const photoCards =
    document.querySelectorAll(".photo-card");

const singlePhotos =
    document.querySelectorAll(".single-photo");

const photoCaptions =
    document.querySelectorAll(".photo-caption");


let targetScroll = 0;
let currentScroll = 0;


/* =========================
   MUSIC SYSTEM
   4 SONGS • CROSSFADE • LOOP
========================= */

const musicTracks = [

    "music/song1.mp3",
    "music/song2.mp3",
    "music/song3.mp3",
    "music/song4.mp3"

];


const musicPlayers = [
    new Audio(),
    new Audio()
];


musicPlayers.forEach(
    (player) => {

        player.preload = "auto";
        player.volume = 0;
        player.loop = false;
        player.playsInline = true;

    }
);


let currentPlayer = 0;
let currentTrack = 0;
let musicStarted = false;
let musicChanging = false;

const CROSSFADE_DURATION = 3;


/* =========================
   LOAD TRACK
========================= */

function loadMusicTrack(
    player,
    trackIndex
) {

    player.src =
        musicTracks[
            trackIndex
        ];

    player.load();

}


/* =========================
   FADE VOLUME
========================= */

function fadeVolume(
    player,
    from,
    to,
    duration
) {

    const startTime =
        performance.now();


    function fade() {

        const elapsed =
            performance.now() -
            startTime;


        const progress =
            clamp(
                elapsed / duration,
                0,
                1
            );


        const smoothProgress =
            smoothStep(
                progress
            );


        player.volume =
            from +
            (
                to - from
            ) *
            smoothProgress;


        if (progress < 1) {

            requestAnimationFrame(
                fade
            );

        }

    }


    requestAnimationFrame(
        fade
    );

}


/* =========================
   START NEXT SONG
========================= */

function crossfadeToNextTrack() {

    if (musicChanging) return;

    musicChanging = true;


    const oldPlayer =
        musicPlayers[
            currentPlayer
        ];


    const nextPlayerIndex =
        currentPlayer === 0
            ? 1
            : 0;


    const nextTrackIndex =
        (
            currentTrack + 1
        ) %
        musicTracks.length;


    const nextPlayer =
        musicPlayers[
            nextPlayerIndex
        ];


    currentTrack =
        nextTrackIndex;


    loadMusicTrack(
        nextPlayer,
        currentTrack
    );


    nextPlayer.currentTime = 0;
    nextPlayer.volume = 0;


    const playPromise =
        nextPlayer.play();


    if (
        playPromise &&
        typeof playPromise.catch === "function"
    ) {

        playPromise.catch(
            () => {

                musicChanging = false;

            }
        );

    }


    fadeVolume(
        oldPlayer,
        oldPlayer.volume,
        0,
        CROSSFADE_DURATION * 1000
    );


    fadeVolume(
        nextPlayer,
        0,
        1,
        CROSSFADE_DURATION * 1000
    );


    setTimeout(
        () => {

            oldPlayer.pause();
            oldPlayer.currentTime = 0;

            currentPlayer =
                nextPlayerIndex;

            musicChanging = false;

        },
        CROSSFADE_DURATION * 1000
    );

}


/* =========================
   WATCH SONG PROGRESS
========================= */

musicPlayers.forEach(
    (player) => {

        player.addEventListener(
            "timeupdate",
            () => {

                if (!musicStarted) return;
                if (musicChanging) return;

                if (
                    !player.duration ||
                    !isFinite(player.duration)
                ) {
                    return;
                }


                const remaining =
                    player.duration -
                    player.currentTime;


                /*
                 * Begin the next song
                 * before the current one ends.
                 */

                if (
                    remaining <=
                    CROSSFADE_DURATION
                ) {

                    crossfadeToNextTrack();

                }

            }
        );


        /*
         * Safety fallback in case
         * timeupdate misses the timing.
         */

        player.addEventListener(
            "ended",
            () => {

                if (!musicStarted) return;

                if (!musicChanging) {

                    crossfadeToNextTrack();

                }

            }
        );

    }
);


/* =========================
   START MUSIC
========================= */

function startMusic() {

    if (musicStarted) return;

    musicStarted = true;


    const firstPlayer =
        musicPlayers[0];


    currentPlayer = 0;
    currentTrack = 0;


    loadMusicTrack(
        firstPlayer,
        0
    );


    firstPlayer.volume = 0;


    const playPromise =
        firstPlayer.play();


    if (
        playPromise &&
        typeof playPromise.then === "function"
    ) {

        playPromise
            .then(
                () => {

                    fadeVolume(
                        firstPlayer,
                        0,
                        1,
                        2500
                    );

                }
            )
            .catch(
                () => {

                    musicStarted = false;

                }
            );

    }

}


/* =========================
   FIRST USER INTERACTION
========================= */

function beginMusicFromInteraction() {

    startMusic();


    if (musicPrompt) {

        musicPrompt.style.opacity = "0";

        setTimeout(
            () => {

                musicPrompt.style.display =
                    "none";

            },
            1000
        );

    }

}


/*
 * Music begins when the visitor
 * clicks, taps, or interacts.
 */

[
    "pointerdown",
    "touchstart",
    "keydown"
].forEach(
    (eventName) => {

        window.addEventListener(
            eventName,
            beginMusicFromInteraction,
            {
                once: true,
                passive: true
            }
        );

    }
);

/* =========================
   SCROLL TRACKING
========================= */

window.addEventListener("scroll", () => {

    targetScroll =
        window.scrollY;

});


/* =========================
   UTILITY FUNCTIONS
========================= */

function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(value, max)
    );

}


function smoothStep(value) {

    return value * value * (3 - 2 * value);

}


/* =========================
   PHOTO SCENE ANIMATION
========================= */

function animatePhotoScene(
    scene,
    index
) {

    const sceneTop =
        scene.offsetTop;

    const sceneHeight =
        scene.offsetHeight;

    const sceneProgress =
        (
            currentScroll -
            sceneTop
        ) /
        sceneHeight;

    const progress =
        clamp(
            sceneProgress,
            0,
            1
        );


    /*
     * Photo scene enters gently,
     * remains visible,
     * then leaves slowly.
     */

    let visibility;

    if (progress < 0.12) {

        visibility =
            progress / 0.12;

    }

    else if (progress < 0.82) {

        visibility = 1;

    }

    else {

        visibility =
            1 -
            (
                (progress - 0.82) /
                0.18
            );

    }


    visibility =
        smoothStep(
            clamp(
                visibility,
                0,
                1
            )
        );


    /*
     * Give the entire photo composition
     * a very slow cinematic movement.
     */

    const movement =
        (
            progress -
            0.5
        ) * -20;


    const scale =
        0.97 +
        (
            smoothStep(
                clamp(
                    progress,
                    0,
                    1
                )
            ) * 0.05
        );


    const collage =
        scene.querySelector(
            ".photo-collage"
        );


    if (collage) {

        collage.style.transform =
            `
            translate3d(
                0,
                ${movement}px,
                0
            )
            scale(${scale})
            `;

    }


    /*
     * Animate every photograph
     * inside the current composition.
     */

    const cards =
        scene.querySelectorAll(
            ".photo-card"
        );


    cards.forEach(
        (card, cardIndex) => {

            const cardDelay =
                cardIndex * 0.06;

            const cardProgress =
                clamp(
                    (
                        progress -
                        cardDelay
                    ) / 0.34,
                    0,
                    1
                );


            const cardReveal =
                smoothStep(
                    cardProgress
                );


            const cardExit =
                progress > 0.84
                    ? 1 -
                        smoothStep(
                            clamp(
                                (
                                    progress -
                                    0.84
                                ) / 0.16,
                                0,
                                1
                            )
                        )
                    : 1;


            const finalOpacity =
                visibility *
                cardReveal *
                cardExit;


            /*
             * Preserve the deliberate
             * 90-degree rotation.
             */

            const isRotated =
                card.classList.contains(
                    "rotated-left"
                );


            const baseRotation =
                isRotated
                    ? -90
                    : 0;


            const entranceRotation =
                (
                    1 -
                    cardReveal
                ) *
                2;


            const cardY =
                (
                    1 -
                    cardReveal
                ) * 28;


            card.style.opacity =
                clamp(
                    finalOpacity,
                    0,
                    1
                );


            card.style.transform =
                `
                translate3d(
                    0,
                    ${cardY}px,
                    0
                )
                rotate(${baseRotation + entranceRotation}deg)
                `;


            const image =
                card.querySelector("img");


            if (image) {

                const imageScale =
                    1.04 +
                    (
                        smoothStep(
                            clamp(
                                progress,
                                0,
                                1
                            )
                        ) * 0.035
                    );


                image.style.transform =
                    `
                    scale(${imageScale})
                    `;

            }

        }
    );


    /*
     * Single-image scenes.
     */

    const singlePhoto =
        scene.querySelector(
            ".single-photo"
        );


    if (singlePhoto) {

        const photoProgress =
            smoothStep(
                clamp(
                    progress,
                    0,
                    1
                )
            );


        const photoScale =
            0.96 +
            photoProgress * 0.08;


        const photoY =
            (
                1 -
                photoProgress
            ) * 22;


        singlePhoto.style.opacity =
            visibility;


        singlePhoto.style.transform =
            `
            translate3d(
                0,
                ${photoY}px,
                0
            )
            scale(${photoScale})
            `;

    }


    /*
     * Captions appear after the photograph
     * has had time to settle.
     */

    const caption =
        scene.querySelector(
            ".photo-caption"
        );


    if (caption) {

        const captionProgress =
            clamp(
                (
                    progress -
                    0.40
                ) / 0.30,
                0,
                1
            );


        const captionReveal =
            smoothStep(
                captionProgress
            );


        const captionExit =
            progress > 0.86
                ? 1 -
                    smoothStep(
                        clamp(
                            (
                                progress -
                                0.86
                            ) / 0.14,
                            0,
                            1
                        )
                    )
                : 1;


        const finalCaptionOpacity =
            captionReveal *
            captionExit;


        caption.style.opacity =
            clamp(
                finalCaptionOpacity,
                0,
                1
            );


        /*
         * Keep the existing caption
         * positioning while animating
         * only its entrance.
         */

        if (
            caption.classList.contains(
                "special-photo-caption"
            )
        ) {

            caption.style.transform =
                `
                translate(
                    -50%,
                    ${18 - captionReveal * 18}px
                )
                `;

        }

        else {

            caption.style.transform =
                `
                translateY(
                    ${18 - captionReveal * 18}px
                )
                `;

        }

    }

}


/* =========================
   MAIN ANIMATION LOOP
========================= */

function animate() {

    currentScroll +=
        (
            targetScroll -
            currentScroll
        ) * 0.08;


    const maxScroll =
        document.documentElement.scrollHeight -
        window.innerHeight;


    const globalProgress =
        maxScroll > 0
            ? clamp(
                currentScroll /
                maxScroll,
                0,
                1
            )
            : 0;


    /* =========================
       LIVING SKY
    ========================= */

    const skyStart = 0.30;

    const skyProgress =
        globalProgress <= skyStart
            ? 0
            : (
                (
                    globalProgress -
                    skyStart
                ) /
                (
                    1 -
                    skyStart
                )
            ) * 4;


    skies.forEach(
        (sky, index) => {

            let opacity = 0;


            /*
             * SKY 1
             */

            if (index === 0) {

                if (
                    globalProgress <=
                    skyStart
                ) {

                    opacity = 1;

                }

                else {

                    const fade =
                        clamp(
                            skyProgress,
                            0,
                            1
                        );

                    opacity =
                        1 -
                        smoothStep(
                            fade
                        );

                }

            }


            /*
             * SKY 2, 3, 4, 5
             */

            else {

                const localProgress =
                    skyProgress -
                    (
                        index -
                        1
                    );


                const fadeIn =
                    clamp(
                        localProgress,
                        0,
                        1
                    );


                const fadeOut =
                    clamp(
                        localProgress -
                        0.55,
                        0,
                        1
                    );


                opacity =
                    smoothStep(
                        fadeIn
                    ) *
                    (
                        1 -
                        smoothStep(
                            fadeOut
                        )
                    );

            }


            /*
             * Cinematic movement.
             */

            const imageProgress =
                clamp(
                    skyProgress -
                    index +
                    1,
                    0,
                    1
                );


            const smoothImageProgress =
                smoothStep(
                    imageProgress
                );


            const scale =
                1.04 +
                smoothImageProgress *
                0.13;


            const moveX =
                Math.sin(
                    smoothImageProgress *
                    Math.PI
                ) *
                -1.5;


            const moveY =
                smoothImageProgress *
                -2.5;


            sky.style.transform =
                `
                translate3d(
                    ${moveX}vw,
                    ${moveY}vh,
                    0
                )
                scale(${scale})
                `;


            sky.style.opacity =
                clamp(
                    opacity,
                    0,
                    1
                );

        }
    );


    /* =========================
       OPENING
    ========================= */

    if (openingText) {

        const fadeDistance =
            window.innerHeight *
            1.25;


        const openingProgress =
            clamp(
                currentScroll /
                fadeDistance,
                0,
                1
            );


        openingText.style.opacity =
            1 -
            smoothStep(
                openingProgress
            );


        openingText.style.transform =
            `
            translateY(
                ${openingProgress * -35}px
            )
            `;

    }


    /* =========================
       INTRODUCTION
    ========================= */

    if (storyText) {

        const scene =
            storyText.closest(
                ".scene"
            );


        const sceneTop =
            scene.offsetTop;


        const sceneHeight =
            scene.offsetHeight;


        const sceneProgress =
            (
                currentScroll -
                sceneTop
            ) /
            sceneHeight;


        const progress =
            clamp(
                sceneProgress,
                0,
                1
            );


        let opacity;


        if (progress < 0.15) {

            opacity =
                progress / 0.15;

        }

        else if (progress < 0.72) {

            opacity = 1;

        }

        else {

            opacity =
                1 -
                (
                    (
                        progress -
                        0.72
                    ) /
                    0.28
                );

        }


        storyText.style.opacity =
            clamp(
                opacity,
                0,
                1
            );


        const movement =
            (
                1 -
                progress
            ) * 35;


        storyText.style.transform =
            `
            translateY(
                ${movement}px
            )
            `;

    }


    /* =========================
       LETTER SECTIONS
    ========================= */

    letterSections.forEach(
        (
            letterSection
        ) => {

            const scene =
                letterSection.closest(
                    ".letter-scene"
                );


            if (!scene) return;


            const sceneTop =
                scene.offsetTop;


            const sceneHeight =
                scene.offsetHeight;


            const sceneProgress =
                (
                    currentScroll -
                    sceneTop
                ) /
                sceneHeight;


            const progress =
                clamp(
                    sceneProgress,
                    0,
                    1
                );


            let opacity;


            if (progress < 0.10) {

                opacity =
                    progress / 0.10;

            }

            else if (progress < 0.86) {

                opacity = 1;

            }

            else {

                opacity =
                    1 -
                    (
                        (
                            progress -
                            0.86
                        ) /
                        0.14
                    );

            }


            letterSection.style.opacity =
                clamp(
                    opacity,
                    0,
                    1
                );


            const movement =
                (
                    1 -
                    progress
                ) * 18;


            letterSection.style.transform =
                `
                translateY(
                    ${movement}px
                )
                `;

        }
    );


    /* =========================
       PHOTO CHAPTER
    ========================= */

    photoScenes.forEach(
        (
            scene,
            index
        ) => {

            animatePhotoScene(
                scene,
                index
            );

        }
    );


    requestAnimationFrame(
        animate
    );

}


/* =========================
   START ANIMATION
========================= */

requestAnimationFrame(
    animate
);