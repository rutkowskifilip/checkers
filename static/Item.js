class Item extends THREE.Mesh {

    constructor(color, x, y, posX, posY) {
        const geometry = new THREE.BoxGeometry(14, 5, 14);
        const material = new THREE.MeshBasicMaterial({
            wireframe: false,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide, // dwustronny
            map: new THREE.TextureLoader().load(color === "white" ? './textures/whitewood2.jpg' : './textures/blackwood.jpg'), // plik tekstury
        })

        //this.cube = new THREE.Mesh(geometry, material);
        super(geometry, material) // wywołanie konstruktora klasy z której dziedziczymy czyli z Mesha
        this.x = x
        this.y = y
        this.col = color
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z)
    }

    setXY(x, y) {
        this.x = x
        this.y = y
    }

    getColor() {
        return this.col
    }
    getPosition() {
        return { x: this.x, y: this.y }
    }
    getType() {
        return "item"
    }
}

export default Item