import Item from './Item.js'
import Pawn from './Pawn.js'

export default class Game {
    constructor() {
        this.pawnsMade = false

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xA9A9A9);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        //siatka
        const axes = new THREE.AxesHelper(1000)
        axes.position.y = 17.5

        this.doneW = false
        this.doneB = false

        this.szachownica = [
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
        ];

        this.pionki = [
            [0, 2, 0, 2, 0, 2, 0, 2],
            [2, 0, 2, 0, 2, 0, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
        ]
        this.tabWhite = []
        this.tabBlack = []
        this.tabBoard = [
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
        ];
        this.timeoutSetted = false
        this.getDataInterval
        this.lastBlocks = [{}, {}]
        this.blackScore = 0
        this.whiteScore = 0
        this.zbite = []
        this.timer = 30

        this.board()

        document.getElementById("root").append(this.renderer.domElement);



        this.camera.position.set(0, 120, 120)
        this.camera.lookAt(this.scene.position)

        this.render() // wywołanie metody render

        this.onWindowResize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', this.onWindowResize, false);


        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2()
        this.intersects = this.raycaster.intersectObjects(this.scene.children);
        this.currentPawn = ""
        this.currentObj = ""

        window.addEventListener('mousedown', e => {
            if (yourTurn)
                try {
                    if (playerBlackLoggedIn || playerWhiteLoggedIn) {
                        if (this.currentPawn != "") {
                            if (this.currentPawn.getColor() === "black" && playerBlackLoggedIn)
                                this.currentPawn.material.map = this.setMaterial(1)
                            else if (this.currentPawn.getColor() === "white" && !playerBlackLoggedIn)
                                this.currentPawn.material.map = this.setMaterial(0)

                            this.tabBoard[this.lastBlocks[0].y][this.lastBlocks[0].x].material.map = this.setMaterial(3)
                            this.tabBoard[this.lastBlocks[1].y][this.lastBlocks[1].x].material.map = this.setMaterial(3)
                        }

                        this.mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
                        this.mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
                        this.raycaster.setFromCamera(this.mouseVector, this.camera);
                        const intersects = this.raycaster.intersectObjects(this.scene.children);
                        if (intersects[0].object != this.currentPawn) {

                            this.currentObj = this.raycaster.intersectObjects(this.scene.children)[0].object;

                            if (this.currentObj.getType() === "item") {
                                let newPos = this.currentObj.getPosition()
                                console.log(this.currentObj.getColor())
                                let lastPos = this.currentPawn.getPos()
                                if (this.currentObj.getColor() === "black") {
                                    if (playerBlackLoggedIn && this.currentPawn.getColor() === "black") {
                                        if (this.pionki[newPos.y][newPos.x] === 0)
                                            if ((lastPos.x - newPos.x === 1 || lastPos.x - newPos.x === -1) && (lastPos.y - newPos.y === -1)) {
                                                this.move("black", newPos, lastPos)
                                            } else if ((lastPos.x - newPos.x === 2 && lastPos.y - newPos.y === -2)
                                                && this.pionki[lastPos.y + 1][lastPos.x - 1] === 1) {
                                                for (let i = 0; i < this.tabWhite.length; i++) {
                                                    if (this.tabWhite[i].x === lastPos.x - 1 && this.tabWhite[i].y === lastPos.y + 1 && !this.tabWhite[i].capture) {
                                                        this.blackScore += 1
                                                        this.scene.remove(this.tabWhite[i])
                                                        this.pionki[this.tabWhite[i].y][this.tabWhite[i].x] = 0
                                                        this.tabWhite[i].setCapture(true)
                                                        if (this.blackScore === 8) {
                                                            let toPass = { winner: yourColor }
                                                            fetch("/setWinner", { method: "post", body: JSON.stringify(toPass) })
                                                            this.endGame("win")
                                                        }
                                                        const body = JSON.stringify({
                                                            color: "white",
                                                            pawnID: i
                                                        })

                                                        fetch("/capturing ", { method: "post", body })
                                                    }
                                                }
                                                this.move("black", newPos, lastPos)
                                            } else if (lastPos.x - newPos.x === -2 && lastPos.y - newPos.y === -2
                                                && this.pionki[lastPos.y + 1][lastPos.x + 1] === 1) {
                                                for (let i = 0; i < this.tabWhite.length; i++) {
                                                    if (this.tabWhite[i].x === lastPos.x + 1 && this.tabWhite[i].y === lastPos.y + 1 && !this.tabWhite[i].capture) {
                                                        this.blackScore += 1
                                                        this.scene.remove(this.tabWhite[i])
                                                        this.pionki[this.tabWhite[i].y][this.tabWhite[i].x] = 0
                                                        this.tabWhite[i].setCapture(true)
                                                        if (this.blackScore === 8) {
                                                            let toPass = { winner: yourColor }
                                                            fetch("/setWinner", { method: "post", body: JSON.stringify(toPass) })
                                                            this.endGame("win")
                                                        }
                                                        const body = JSON.stringify({
                                                            color: "white",
                                                            pawnID: i
                                                        })

                                                        fetch("/capturing ", { method: "post", body })
                                                    }
                                                }
                                                this.move("black", newPos, lastPos)
                                            }
                                    }
                                    else if (!playerBlackLoggedIn && this.currentPawn.getColor() === "white") {
                                        if (this.pionki[newPos.y][newPos.x] === 0)
                                            if ((lastPos.x - newPos.x === 1 || lastPos.x - newPos.x === -1) && (lastPos.y - newPos.y === 1)) {
                                                this.move("white", newPos, lastPos)
                                            } else if ((lastPos.x - newPos.x === 2 && lastPos.y - newPos.y === 2)
                                                && this.pionki[lastPos.y - 1][lastPos.x - 1] === 2) {

                                                for (let i = 0; i < this.tabBlack.length; i++) {
                                                    if (this.tabBlack[i].x === lastPos.x - 1 && this.tabBlack[i].y === lastPos.y - 1 && !this.tabBlack[i].capture) {
                                                        this.whiteScore++
                                                        this.scene.remove(this.tabBlack[i])
                                                        this.pionki[this.tabBlack[i].y][this.tabBlack[i].x] = 0
                                                        console.log(this.whiteScore)
                                                        this.tabBlack[i].setCapture(true)
                                                        if (this.whiteScore === 8) {
                                                            let toPass = { winner: yourColor }
                                                            fetch("/setWinner", { method: "post", body: JSON.stringify(toPass) })
                                                            this.endGame("win")
                                                        }
                                                        const body = JSON.stringify({
                                                            color: "black",
                                                            pawnID: i
                                                        })

                                                        fetch("/capturing ", { method: "post", body })
                                                    }
                                                }
                                                this.move("white", newPos, lastPos)
                                            } else if ((lastPos.x - newPos.x === -2 && lastPos.y - newPos.y === 2)
                                                && this.pionki[lastPos.y - 1][lastPos.x + 1] === 2) {

                                                for (let i = 0; i < this.tabBlack.length; i++) {
                                                    if (this.tabBlack[i].x === lastPos.x + 1 && this.tabBlack[i].y === lastPos.y - 1 && !this.tabBlack[i].capture) {
                                                        this.whiteScore++
                                                        this.scene.remove(this.tabBlack[i])
                                                        this.pionki[this.tabBlack[i].y][this.tabBlack[i].x] = 0
                                                        console.log(this.whiteScore)
                                                        this.tabBlack[i].setCapture(true)
                                                        if (this.whiteScore === 8) {
                                                            let toPass = { winner: yourColor }
                                                            fetch("/setWinner", { method: "post", body: JSON.stringify(toPass) })
                                                            this.endGame("win")
                                                        }
                                                        const body = JSON.stringify({
                                                            color: "black",
                                                            pawnID: i
                                                        })

                                                        fetch("/capturing ", { method: "post", body })
                                                    }
                                                }
                                                this.move("white", newPos, lastPos)
                                            }
                                    }
                                }
                                this.currentPawn = ""
                            }
                            if (this.currentObj.getType() === "pawn") {
                                this.currentPawn = this.currentObj
                                this.pos = this.currentPawn.getPos()
                                if (playerBlackLoggedIn && this.currentPawn.getColor() === 'black') {
                                    this.currentPawn.material.map = this.setMaterial(2)

                                    if (this.pos.y !== 7) {
                                        if (this.pos.x !== 0)
                                            if (this.pionki[this.pos.y + 1][this.pos.x - 1] === 0) {
                                                this.tabBoard[this.pos.y + 1][this.pos.x - 1].material.map = this.setMaterial(2)
                                                this.lastBlocks[0] = { x: this.pos.x - 1, y: this.pos.y + 1 }
                                            }
                                            else if (this.pos.x > 1 && this.pos.y < 6)
                                                if (this.pionki[this.pos.y + 1][this.pos.x - 1] === 1 && this.pionki[this.pos.y + 2][this.pos.x - 2] === 0) {
                                                    this.tabBoard[this.pos.y + 2][this.pos.x - 2].material.map = this.setMaterial(2)
                                                    this.lastBlocks[0] = { x: this.pos.x - 2, y: this.pos.y + 2 }
                                                }

                                        if (this.pos.x !== 8)
                                            if (this.pionki[this.pos.y + 1][this.pos.x + 1] === 0) {
                                                this.tabBoard[this.pos.y + 1][this.pos.x + 1].material.map = this.setMaterial(2)
                                                this.lastBlocks[1] = { x: this.pos.x + 1, y: this.pos.y + 1 }
                                            }
                                            else if (this.pos.x < 6 && this.pos.y < 6)
                                                if (this.pionki[this.pos.y + 1][this.pos.x + 1] === 1 && this.pionki[this.pos.y + 2][this.pos.x + 2] === 0) {
                                                    this.tabBoard[this.pos.y + 2][this.pos.x + 2].material.map = this.setMaterial(2)
                                                    this.lastBlocks[1] = { x: this.pos.x + 2, y: this.pos.y + 2 }
                                                }
                                    }

                                } else if (!playerBlackLoggedIn && this.currentPawn.getColor() === 'white') {
                                    this.currentPawn.material.map = this.setMaterial(2)
                                    if (this.pos.y !== 0) {
                                        if (this.pos.x !== 0)
                                            if (this.pionki[this.pos.y - 1][this.pos.x - 1] === 0) {
                                                this.tabBoard[this.pos.y - 1][this.pos.x - 1].material.map = this.setMaterial(2)
                                                this.lastBlocks[0] = { x: this.pos.x - 1, y: this.pos.y - 1 }
                                            }
                                            else if (this.pos.x > 1 && this.pos.y > 1)
                                                if (this.pionki[this.pos.y - 1][this.pos.x - 1] === 2 && this.pionki[this.pos.y - 2][this.pos.x - 2] === 0) {
                                                    this.tabBoard[this.pos.y - 2][this.pos.x - 2].material.map = this.setMaterial(2)
                                                    this.lastBlocks[0] = { x: this.pos.x - 2, y: this.pos.y - 2 }
                                                }

                                        if (this.pos.x !== 8)
                                            if (this.pionki[this.pos.y - 1][this.pos.x + 1] === 0) {
                                                this.tabBoard[this.pos.y - 1][this.pos.x + 1].material.map = this.setMaterial(2)
                                                this.lastBlocks[1] = { x: this.pos.x + 1, y: this.pos.y - 1 }
                                            }
                                            else if (this.pos.x < 6 && this.pos.y > 1)
                                                if (this.pionki[this.pos.y - 1][this.pos.x + 1] === 2 && this.pionki[this.pos.y - 2][this.pos.x + 2] === 0) {
                                                    this.tabBoard[this.pos.y - 2][this.pos.x + 2].material.map = this.setMaterial(2)
                                                    this.lastBlocks[1] = { x: this.pos.x + 2, y: this.pos.y - 2 }
                                                }
                                    }
                                }
                            }
                        } else {
                            this.currentPawn = ""
                        }
                    }
                } catch (e) {
                    this.currentPawn = ""
                    console.log('nie klikasz w pionka')
                }
        })
    }
    move(color, newPos, lastPos) {
        new TWEEN.Tween(this.currentPawn.position) // co
            .to({ x: 14 * (newPos.x - 3.5), z: 14 * (newPos.y - 3.5) }, 500) // do jakiej pozycji, w jakim czasie
            .easing(TWEEN.Easing.Linear.None) // typ easingu (zmiana w czasie)
            .start()
        this.pionki[lastPos.y][lastPos.x] = 0
        this.pionki[newPos.y][newPos.x] = color === "white" ? 1 : 2
        this.currentPawn.setPos(newPos.x, newPos.y)

        const body = JSON.stringify({
            pawnColor: this.currentPawn.getColor(),
            newPos: newPos,
            lastPos: lastPos,
            pawnID: this.currentPawn.getID()
        })
        //console.table(this.pionki)
        fetch("/setBoard", { method: "post", body }) // fetch
    }

    getData() {
        const body = {}
        fetch("/getCapture", { method: "post", body })
            .then(response => response.json())
            .then(res => {
                if (playerBlackLoggedIn && res.color === "black") {
                    if (!this.zbite.includes(res.pawnID)) {
                        this.scene.remove(this.tabBlack[res.pawnID])
                        this.zbite.push(res.pawnID)
                        this.pionki[this.tabBlack[res.pawnID].y][this.tabBlack[res.pawnID].x] = 0
                        this.whiteScore++
                        console.log(this.whiteScore)
                    }
                } else if (!playerBlackLoggedIn && res.color === "white") {
                    if (!this.zbite.includes(res.pawnID)) {
                        this.scene.remove(this.tabWhite[res.pawnID])
                        this.zbite.push(res.pawnID)
                        this.pionki[this.tabWhite[res.pawnID].y][this.tabWhite[res.pawnID].x] = 0
                        this.blackScore++
                        console.log(this.blackScore)
                    }
                }
            })
        fetch("/getBoard", { method: "post", body }) // fetch
            .then(response => response.json())
            .then(
                res => {
                    let data = res
                    if (playerBlackLoggedIn && data.pawnColor === "white") {
                        new TWEEN.Tween(this.tabWhite[data.pawnID].position)
                            .to({ x: 14 * (data.newPos.x - 3.5), z: 14 * (data.newPos.y - 3.5) }, 500) // do jakiej pozycji, w jakim czasie
                            .easing(TWEEN.Easing.Linear.None) // typ easingu (zmiana w czasie)
                            .start()
                        this.pionki[data.lastPos.y][data.lastPos.x] = 0
                        this.pionki[data.newPos.y][data.newPos.x] = 1
                        this.tabWhite[data.pawnID].setPos(data.newPos.x, data.newPos.y)
                    } else if (!playerBlackLoggedIn && data.pawnColor === "black") {
                        new TWEEN.Tween(this.tabBlack[data.pawnID].position)
                            .to({ x: 14 * (data.newPos.x - 3.5), z: 14 * (data.newPos.y - 3.5) }, 500) // do jakiej pozycji, w jakim czasie
                            .easing(TWEEN.Easing.Linear.None) // typ easingu (zmiana w czasie)
                            .start()
                        this.pionki[data.lastPos.y][data.lastPos.x] = 0
                        this.pionki[data.newPos.y][data.newPos.x] = 2
                        this.tabBlack[data.pawnID].setPos(data.newPos.x, data.newPos.y)
                    }
                    if (this.timer < 1) {
                        let toPass = { winner: yourColor }
                        fetch("/setWinner", { method: "post", body: JSON.stringify(toPass) })
                        this.endGame("win")
                    } else if (bothPlayersLogged && data.turn !== yourColor && data.winner === "none") {
                        yourTurn = false
                        document.querySelector('.waiting').style.display = 'flex'
                        this.timer--
                        document.querySelector('#text').innerHTML = this.timer
                    } else {
                        this.timer = 30
                    }
                    if ((yourColor === "white" && this.blackScore === 8) || (yourColor === "black" && this.whiteScore === 8)) {
                        this.endGame("lost")
                    }
                    if (bothPlayersLogged && data.turn === yourColor) {
                        yourTurn = true
                        document.querySelector('.waiting').style.display = 'none'
                    }
                    console.log(res.winner)
                    if (res.winner !== yourColor && res.winner !== "none") {
                        this.endGame("lost")
                    }
                })
    }
    endGame(result) {
        document.querySelector('.waiting').style.display = 'flex'
        document.querySelector('#text').innerHTML = "You " + result
        setTimeout(() => {
            reset()
            window.location.reload(true);
        }, 3000)
    }

    makeWhitePons() {
        this.board()
        this.pawns()
        this.camera.position.set(0, 120, 120)
    }

    makeBlackPons() {
        this.board()
        this.pawns()
        this.camera.position.set(0, 120, -120)
    }

    board = () => {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.szachownica[i][j] == 0) {
                    const item = new Item("white", j, i)
                    item.setPosition(14 * (j - 3.5), 20, 14 * (i - 3.5), j, i)
                    this.scene.add(item);
                }
                else {
                    const item = new Item("black", j, i)
                    item.setPosition(14 * (j - 3.5), 20, 14 * (i - 3.5), j, i)
                    this.tabBoard[i][j] = item
                    this.scene.add(item);
                }
            }
        }
    }

    pawns = () => {
        let whiteID = 0
        let blackID = 0
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.pionki[i][j] == 1) {
                    const pawn = new Pawn("white", j, i)
                    pawn.setPosition(14 * (j - 3.5), 24, 14 * (i - 3.5))
                    pawn.setID(whiteID)
                    whiteID++
                    this.tabWhite.push(pawn)
                    this.scene.add(pawn);
                }
                else if (this.pionki[i][j] == 2) {
                    const pawn = new Pawn("black", j, i)
                    pawn.setPosition(14 * (j - 3.5), 24, 14 * (i - 3.5))
                    pawn.setID(blackID)
                    blackID++
                    this.tabBlack.push(pawn)
                    this.scene.add(pawn);
                }
            }
        }
    }


    render = () => {
        requestAnimationFrame(this.render);
        this.renderer.render(this.scene, this.camera);
        this.camera.lookAt(this.scene.position)

        if ((this.doneW != true || this.doneB != true) && !this.pawnsMade) {
            if (playerWhiteLoggedIn && !playerBlackLoggedIn) {
                this.makeWhitePons()

                this.doneW = true
                this.pawnsMade = true
            }
            if (playerBlackLoggedIn) {
                this.makeBlackPons()
                this.doneB = true
                this.pawnsMade = true
            }
        }
        if (!this.timeoutSetted && this.pawnsMade) {
            this.timeoutSetted = true
            this.getDataInterval = setInterval(() => this.getData(), 1000)
        }
        TWEEN.update();
    }

    setMaterial(num) {
        const materials = [
            './textures/whitewood.jpg',
            './textures/redwood.jpg',
            './textures/yellowwood.jpg',
            './textures/blackwood.jpg'
        ]
        return new THREE.TextureLoader().load(materials[num])
    }
}