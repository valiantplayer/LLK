
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad() {
        window.gameDate = this
        this.init()
    },

    init: function () {
        this.levelInfo = [
            {},
            { w: 4, h: 4, canMove: false, arrMove: [0, 3, 1, 2], gameTime: 25 * 60 },
            { w: 4, h: 4, canMove: false, arrMove: [0, 3, 1, 2], gameTime: 25 * 60 },//2

            { w: 5, h: 6, canMove: false, arrMove: [0], gameTime: 38 * 60 },
            { w: 5, h: 6, canMove: false, arrMove: [0], gameTime: 38 * 60 },
            { w: 5, h: 6, canMove: false, arrMove: [0], gameTime: 38 * 60 },//5

            { w: 5, h: 6, canMove: true, arrMove: [0], gameTime: 42 * 60 },
            { w: 5, h: 6, canMove: true, arrMove: [1], gameTime: 42 * 60 },
            { w: 5, h: 6, canMove: true, arrMove: [2], gameTime: 42 * 60 },
            { w: 5, h: 6, canMove: true, arrMove: [3], gameTime: 42 * 60 },//9

            { w: 5, h: 6, canMove: true, arrMove: [0, 1], gameTime: 45 * 60 },
            { w: 5, h: 6, canMove: true, arrMove: [1, 2], gameTime: 45 * 60 },
            { w: 5, h: 6, canMove: true, arrMove: [2, 3], gameTime: 45 * 60 },
            { w: 5, h: 6, canMove: true, arrMove: [3, 0], gameTime: 45 * 60 },//13

            { w: 5, h: 6, canMove: true, arrMove: [0, 1, 2], gameTime: 48 * 60 },
            { w: 5, h: 6, canMove: true, arrMove: [2, 3, 0], gameTime: 48 * 60 },//15

            { w: 5, h: 6, canMove: true, arrMove: [0, 1, 2, 3], gameTime: 53 * 60 },
            { w: 5, h: 6, canMove: true, arrMove: [1, 2, 3, 0], gameTime: 53 * 60 },
            { w: 5, h: 6, canMove: true, arrMove: [2, 3, 0, 1], gameTime: 53 * 60 },
            { w: 5, h: 6, canMove: true, arrMove: [3, 0, 1, 2], gameTime: 53 * 60 },//19


            { w: 6, h: 6, canMove: true, arrMove: [0, 1, 2, 3], gameTime: 58 * 60 },
            { w: 6, h: 6, canMove: true, arrMove: [1, 2, 3, 0], gameTime: 58 * 60 },
            { w: 6, h: 6, canMove: true, arrMove: [2, 3, 0, 1], gameTime: 58 * 60 },
            { w: 6, h: 6, canMove: true, arrMove: [3, 0, 1, 2], gameTime: 58 * 60 },//20~23

            { w: 6, h: 6, canMove: true, arrMove: [0, 3, 1, 2], gameTime: 60 * 60 },//上右下左
            { w: 6, h: 6, canMove: true, arrMove: [1, 3, 0, 2], gameTime: 60 * 60 },//下右上左
            { w: 6, h: 6, canMove: true, arrMove: [0, 2, 1, 3], gameTime: 60 * 60 },//上左下右
            { w: 6, h: 6, canMove: true, arrMove: [1, 2, 0, 3], gameTime: 60 * 60 },//下左上右   //24~28

            { w: 6, h: 7, canMove: false, arrMove: [0], gameTime: 65 * 60 },//
            { w: 6, h: 7, canMove: false, arrMove: [1], gameTime: 65 * 60 },//
            { w: 6, h: 7, canMove: false, arrMove: [0], gameTime: 65 * 60 },//
            { w: 6, h: 7, canMove: false, arrMove: [1], gameTime: 65 * 60 },//29~32

            { w: 6, h: 8, canMove: false, arrMove: [0], gameTime: 72 * 60 },
            { w: 6, h: 8, canMove: false, arrMove: [1], gameTime: 72 * 60 },
            { w: 6, h: 8, canMove: false, arrMove: [0], gameTime: 72 * 60 },
            { w: 6, h: 8, canMove: false, arrMove: [1], gameTime: 72 * 60 },//33~36

            { w: 7, h: 8, canMove: false, arrMove: [0], gameTime: 77 * 60 },//
            { w: 7, h: 8, canMove: false, arrMove: [1], gameTime: 77 * 60 },//
            { w: 7, h: 8, canMove: false, arrMove: [0], gameTime: 77 * 60 },//
            { w: 7, h: 8, canMove: false, arrMove: [1], gameTime: 77 * 60 },//37~40

            { w: 8, h: 8, canMove: true, arrMove: [0, 1, 2, 3, 3, 2, 1, 0], gameTime: 87 * 60 },//
            { w: 8, h: 8, canMove: true, arrMove: [1, 2, 3, 3, 2, 1, 0, 1], gameTime: 87 * 60 },//
            { w: 8, h: 8, canMove: true, arrMove: [2, 3, 3, 2, 1, 0, 1, 2], gameTime: 87 * 60 },//
            { w: 8, h: 8, canMove: true, arrMove: [3, 3, 2, 1, 0, 1, 2, 3], gameTime: 87 * 60 },//
            { w: 8, h: 8, canMove: true, arrMove: [3, 2, 1, 0, 1, 2, 3, 0], gameTime: 87 * 60 },//41~85

            { w: 8, h: 9, canMove: true, arrMove: [2, 1, 0, 1, 2, 3, 0, 1], gameTime: 95 * 60 },//
            { w: 8, h: 9, canMove: true, arrMove: [1, 0, 1, 2, 3, 0, 1, 2], gameTime: 95 * 60 },//
            { w: 8, h: 9, canMove: true, arrMove: [0, 1, 2, 3, 0, 1, 2, 3], gameTime: 95 * 60 },//
            { w: 8, h: 9, canMove: true, arrMove: [1, 2, 3, 0, 1, 2, 3, 3], gameTime: 95 * 60 },//
            { w: 8, h: 9, canMove: true, arrMove: [2, 3, 0, 1, 2, 3, 3, 2], gameTime: 95 * 60 },//46~50

        ]
    }

    // update (dt) {},
});
