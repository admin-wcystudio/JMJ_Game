import GameManager from '../scenes/GameManager.js';
import { gameConfig } from '../config.js';

export default class VoiceOverHelper {
    static FADE_MS = 200;
    static BGM_VOLUME = 0.32;
    static BGM_DUCKED_VOLUME = 0.08;
    static AUDIO_BASE = 'assets/VO';
    static bgmAllowed = false;
    static currentBubbleKey = null;

    // Street bubble texture keys. Audio bases are resolved in SEMANTIC_TO_BOX.
    // Games 3–5 show the lock lines until the previous reward stages are cleared.
    static GAME_DIALOGUE = {
        1: {
            street: ['npc1_bubble_1']
        },
        2: {
            street: ['npc2_bubble_1']
        },
        3: {
            streetLock: ['npc3_bubble_reject_01', 'npc3_bubble_reject_02'],
            street: ['npc3_bubble_1']
        },
        4: {
            streetLock: ['npc4_bubble_reject_01', 'npc4_bubble_reject_02'],
            street: ['npc4_bubble_1']
        },
        5: {
            streetLock: ['npc5_bubble_reject_01', 'npc5_bubble_reject_02'],
            street: ['npc5_bubble_1', 'npc5_bubble_2', 'npc5_bubble_3', 'npc5_bubble_4']
        },
        6: {
            street: ['npc6_bubble_1', 'npc6_bubble_2']
        }
    };

    // Game 3 needs the hairpin from game 2. Game 4 needs the map from game 3.
    // Game 5 needs both the map and the lock tool.
    static STREET_PREREQS = {
        3: [2],
        4: [3],
        5: [3, 4]
    };

    static STEMS = [
        'Game_1/game1_npc_box1',
        'Game_2/game2_npc_box1',
        'Game_2/game2_npc_box2',
        'Game_2/game2_npc_box3',
        'Game_3/game3_npc_box1',
        'Game_3/game3_npc_box2',
        'Game_3/game3_npc_box3',
        'Game_4/game4_npc_box1',
        'Game_4/game4_npc_box2',
        'Game_4/game4_npc_box3',
        'Game_4/game4_npc_box4',
        'Game_4/game4_npc_box5',
        'Game_5/game5_npc_box1',
        'Game_5/game5_npc_box2',
        'Game_5/game5_npc_box3_boy',
        'Game_5/game5_npc_box3_girl',
        'Game_5/game5_npc_box4_boy',
        'Game_5/game5_npc_box4_girl',
        'Game_5/game5_npc_box5',
        'Game_5/game5_npc_box6',
        'Game_6/game6_npc_box1',
        'Game_6/game6_npc_box2'
    ];

    static FILE_OVERRIDES = {};

    static SEMANTIC_TO_BOX = {
        npc1_bubble_1: 'game1_npc_box1',
        npc2_bubble_1: 'game2_npc_box1',
        game2_npc_box_win: 'game2_npc_box2',
        game2_npc_box_tryagain: 'game2_npc_box3',
        npc3_bubble_reject_01: 'game3_npc_box1',
        npc3_bubble_reject_02: 'game3_npc_box2',
        npc3_bubble_1: 'game3_npc_box3',
        npc4_bubble_reject_01: 'game4_npc_box1',
        npc4_bubble_reject_02: 'game4_npc_box2',
        npc4_bubble_1: 'game4_npc_box3',
        game4_npc_box_win: 'game4_npc_box4',
        game4_npc_box_tryagain: 'game4_npc_box5',
        npc5_bubble_reject_01: 'game5_npc_box1',
        npc5_bubble_reject_02: 'game5_npc_box2',
        npc5_bubble_1: 'game5_npc_box3',
        npc5_bubble_2: 'game5_npc_box4',
        npc5_bubble_3: 'game5_npc_box5',
        npc5_bubble_4: 'game5_npc_box6',
        npc6_bubble_1: 'game6_npc_box1',
        npc6_bubble_2: 'game6_npc_box2'
    };

    static NPC_TO_GAME = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };

    static preload(scene) {
        if (!scene._voLoadErrorBound) {
            scene._voLoadErrorBound = true;
            scene.load.on('loaderror', (file) => {
                if (file && file.type === 'audio' && file.key !== 'bgm') {
                    console.warn('[VO] skipped missing audio', file.key);
                }
            });
        }

        VoiceOverHelper.STEMS.forEach((stem) => {
            const [folder, fileBase] = stem.split('/');
            ['Mandarin', 'Cantonese'].forEach((lang) => {
                const key = `${fileBase}_${lang}`;
                if (scene.cache.audio.exists(key)) return;
                const override = VoiceOverHelper.FILE_OVERRIDES[key];
                const path = override || `${VoiceOverHelper.AUDIO_BASE}/${folder}/${fileBase}_${lang}.mp3`;
                scene.load.audio(key, path);
            });
        });
    }

    static getStreetLines(gameId, locked = false) {
        const config = VoiceOverHelper.GAME_DIALOGUE[gameId];
        if (!config) return [];
        if (locked && config.streetLock) return config.streetLock;
        return config.street || [];
    }

    static arePrereqsMet(gameId) {
        if (gameConfig.isTesting) return true;
        const results = GameManager.loadGameResult();
        const needed = VoiceOverHelper.STREET_PREREQS[gameId] || [];
        return needed.every((n) => {
            const res = results.find((r) => r.game === n);
            return res && res.isFinished;
        });
    }

    static getLanguageSuffix() {
        let language = 'HK';
        try {
            const saved = localStorage.getItem('gameSettings');
            if (saved) {
                language = JSON.parse(saved).language || 'HK';
            }
        } catch (e) {
            language = 'HK';
        }
        return language === 'CN' ? 'Mandarin' : 'Cantonese';
    }

    static replayCurrent(scene) {
        const key = VoiceOverHelper.currentBubbleKey;
        if (!key || !scene?.currentVo) return;
        VoiceOverHelper.playBubbleVo(scene, key);
    }

    static getGenderTag() {
        try {
            const player = JSON.parse(localStorage.getItem('player') || '{}');
            return player.gender === 'F' ? 'girl' : 'boy';
        } catch (e) {
            return 'boy';
        }
    }

    static boxBaseFromBubbleKey(bubbleKey) {
        if (!bubbleKey) return null;
        if (VoiceOverHelper.SEMANTIC_TO_BOX[bubbleKey]) {
            return VoiceOverHelper.SEMANTIC_TO_BOX[bubbleKey];
        }

        const genderedBox = /^(game\d+_npc_box\d+)_(?:boy|girl)$/.exec(bubbleKey);
        if (genderedBox) return genderedBox[1];
        if (/^game\d+_npc_box\d+$/.test(bubbleKey)) return bubbleKey;
        if (/^game\d+_popup\d+$/.test(bubbleKey)) return bubbleKey;

        const match = /^npc(\d+)_bubble_(\d+)$/.exec(bubbleKey);
        if (match) {
            const gameId = VoiceOverHelper.NPC_TO_GAME[Number(match[1])];
            return gameId ? `game${gameId}_npc_box${match[2]}` : null;
        }
        return null;
    }

    static resolveKey(scene, boxBase) {
        if (!boxBase) return null;
        const lang = VoiceOverHelper.getLanguageSuffix();
        const genderTag = VoiceOverHelper.getGenderTag();
        const candidates = [
            `${boxBase}_${genderTag}_${lang}`,
            `${boxBase}_${lang}`
        ];
        return candidates.find((key) => scene.cache.audio.exists(key)) || null;
    }

    static getBgm(scene) {
        return scene.sound.get('bgm');
    }

    static ensureBgm(scene) {
        if (!scene.cache.audio.exists('bgm')) return;
        VoiceOverHelper.bgmAllowed = true;

        const start = () => {
            if (!VoiceOverHelper.bgmAllowed) return;
            let bgm = scene.sound.get('bgm');
            if (!bgm) {
                bgm = scene.sound.add('bgm');
            }
            bgm.setLoop(true);
            bgm.setVolume(VoiceOverHelper.BGM_VOLUME);
            if (!bgm.isPlaying) {
                bgm.play({ loop: true, volume: VoiceOverHelper.BGM_VOLUME });
            }
        };

        start();
        scene.sound.once('unlocked', start);
    }

    static stopBgm(scene) {
        VoiceOverHelper.bgmAllowed = false;
        if (scene.currentBgmTween) {
            scene.currentBgmTween.stop();
            scene.currentBgmTween = null;
        }
        const sounds = typeof scene.sound.getAll === 'function'
            ? scene.sound.getAll('bgm')
            : [];
        const single = VoiceOverHelper.getBgm(scene);
        const list = sounds.length ? sounds : (single ? [single] : []);
        list.forEach((bgm) => {
            bgm.setVolume(0);
            bgm.stop();
            bgm.destroy();
        });
        if (typeof scene.sound.removeByKey === 'function') {
            scene.sound.removeByKey('bgm');
        }
    }

    static fadeBgm(scene, volume) {
        if (!VoiceOverHelper.bgmAllowed && volume > 0) return;
        const bgm = VoiceOverHelper.getBgm(scene);
        if (!bgm) return;
        if (scene.currentBgmTween) {
            scene.currentBgmTween.stop();
            scene.currentBgmTween = null;
        }
        scene.currentBgmTween = scene.tweens.add({
            targets: bgm,
            volume,
            duration: VoiceOverHelper.FADE_MS
        });
    }

    static duckBgm(scene) {
        VoiceOverHelper.fadeBgm(scene, VoiceOverHelper.BGM_DUCKED_VOLUME);
    }

    static restoreBgm(scene) {
        if (!VoiceOverHelper.bgmAllowed) return;
        VoiceOverHelper.fadeBgm(scene, VoiceOverHelper.BGM_VOLUME);
    }

    static stop(scene, options = {}) {
        const restoreBgm = options.restoreBgm !== false;
        if (scene.currentVoTween) {
            scene.currentVoTween.stop();
            scene.currentVoTween = null;
        }
        if (scene.currentVo) {
            scene.currentVo.stop();
            scene.currentVo.destroy();
            scene.currentVo = null;
        }
        if (options.clearKey !== false) {
            VoiceOverHelper.currentBubbleKey = null;
        }
        if (restoreBgm) VoiceOverHelper.restoreBgm(scene);
    }

    static playBubbleVo(scene, bubbleKey) {
        VoiceOverHelper.stop(scene, { restoreBgm: false, clearKey: false });
        VoiceOverHelper.currentBubbleKey = bubbleKey || null;
        const boxBase = VoiceOverHelper.boxBaseFromBubbleKey(bubbleKey);
        if (!boxBase) {
            VoiceOverHelper.restoreBgm(scene);
            return;
        }

        const voKey = VoiceOverHelper.resolveKey(scene, boxBase);
        if (!voKey) {
            VoiceOverHelper.restoreBgm(scene);
            return;
        }

        const sound = scene.sound.add(voKey);
        sound.setVolume(0);
        sound.play();
        scene.currentVo = sound;
        VoiceOverHelper.duckBgm(scene);
        scene.currentVoTween = scene.tweens.add({
            targets: sound,
            volume: 1,
            duration: VoiceOverHelper.FADE_MS
        });
        sound.once('complete', () => {
            if (scene.currentVo === sound) {
                scene.currentVo = null;
                if (VoiceOverHelper.currentBubbleKey === bubbleKey) {
                    VoiceOverHelper.currentBubbleKey = null;
                }
                VoiceOverHelper.restoreBgm(scene);
            }
        });
    }
}
