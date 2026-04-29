/**
 * GuineaPigHero — humanoid guinea pig puppet assembled from the guineaparts
 * texture atlas, driven entirely by the data in guineaparts.json.
 *
 * Constructor: new GuineaPigHero(scene, x, y)
 *   x, y — screen position of the torso pivot (the character's body-centre joint).
 *           Use setDepth() on the returned instance to control layering.
 *
 * Public properties after construction:
 *   .joints — plain object mapping every part name to its Phaser.Container.
 *             Each container's local origin (0, 0) sits on the part's joint pivot,
 *             so rotating a container animates that limb around its natural pivot.
 *             Keys: torso, head, leftLeg, leftShin, leftFoot,
 *                   leftShoulder, leftArm, leftHand,
 *                   rightLeg, rightShin, rightFoot,
 *                   rightShoulder, rightArm, rightHand
 *
 * Public method:
 *   .setFacing('left' | 'right') — mirrors the whole puppet on X
 */

// ─────────────────────────────────────────────────────────────────────────────
// Puppet definition — mirrors the relevant sections of guineaparts.json so that
// the class is self-contained and works without a separate JSON load.
//
// Positioning algorithm (matches build-guinea-puppet.js):
//   anchorPx  = anchor offset from the sprite's top-left corner, in screen units
//             = (frame.w * anchor.x * scale, frame.h * anchor.y * scale)  [frame-fraction]
//               (anchor.x * scale, anchor.y * scale)                      [source-px / pixel]
//   jointPt   = anchorPoint of the joint in root-local space
//             = (staticPose.x − rootAnchorX + anchorPx.x,
//                staticPose.y − rootAnchorY + anchorPx.y)
//   container position relative to parent = jointPt − parent.jointPt
//   image position inside container       = (−anchorPx.x, −anchorPx.y), origin (0,0)
// ─────────────────────────────────────────────────────────────────────────────
const GUINEA_PIG_PUPPET_DEF = {
    atlasKey: 'guineaparts',

    // Canvas anchor (torso pivot) used by the output image and this scene placement.
    output: { anchorX: 210, anchorY: 190 },

    // staticPose[partName] = { x, y } pixel top-left of each sprite in the
    // 420×360 reference canvas.  These values come directly from guineaparts.json.
    staticPose: {
        torso:         { x: 99,  y: 126 },
        head:          { x: 135, y: 114 },
        leftShoulder:  { x: 24,  y: 135 },
        leftArm:       { x: 12,  y: 136 },
        leftHand:      { x: 1,   y: 138 },
        rightShoulder: { x: 96,  y: 131 },
        rightArm:      { x: 101, y: 128 },
        rightHand:     { x: 101, y: 131 },
        leftLeg:       { x: 125, y: 151 },
        leftShin:      { x: 125, y: 149 },
        leftFoot:      { x: 119, y: 132 },
        rightLeg:      { x: 147, y: 153 },
        rightShin:     { x: 148, y: 152 },
        rightFoot:     { x: 145, y: 134 },
    },

    // parts[partName] mirrors puppet.parts in guineaparts.json.
    // layer controls back-to-front z-order (lower = further back).
    parts: {
        leftLeg: {
            frame: 'guinea_leftleg',
            parent: 'torso',
            layer: 1,
            scale: 0.1175,
            anchor: { mode: 'frame-fraction', x: 0.16015625, y: 0.5622202327663384 },
        },
        leftShin: {
            frame: 'guinea_leftshin',
            parent: 'leftLeg',
            layer: 1,
            scale: 0.1175,
            anchor: { mode: 'frame-fraction', x: 0.193359375, y: 0.7341092211280215 },
        },
        leftFoot: {
            frame: 'guinea_leftfoot',
            parent: 'leftShin',
            layer: 1,
            scale: 0.1,
            anchor: { mode: 'pixel', x: 226, y: 918 },
        },
        leftShoulder: {
            frame: 'guinea_leftshoulder',
            parent: 'torso',
            layer: 2,
            scale: 0.1,
            anchor: { mode: 'source-px', x: 2290, y: 170 },
        },
        leftArm: {
            frame: 'guinea_leftarm',
            parent: 'leftShoulder',
            layer: 2,
            scale: 0.1,
            anchor: { mode: 'source-px', x: 2478, y: 433 },
        },
        leftHand: {
            frame: 'guinea_lefthand',
            parent: 'leftArm',
            layer: 2,
            scale: 0.1,
            anchor: { mode: 'source-px', x: 2647, y: 621 },
        },
        torso: {
            frame: 'guinea_torso',
            parent: null,
            layer: 3,
            scale: 0.1,
            anchor: { mode: 'source-px', x: 1108, y: 640 },
        },
        head: {
            frame: 'guinea_head',
            parent: 'torso',
            layer: 4,
            scale: 0.1175,
            anchor: { mode: 'frame-fraction', x: 0.11328125, y: 0.35452103849597134 },
        },
        rightLeg: {
            frame: 'guinea_rightleg',
            parent: 'torso',
            layer: 5,
            scale: 0.1175,
            anchor: { mode: 'frame-fraction', x: 0.06689453125, y: 0.5380483437780662 },
        },
        rightShin: {
            frame: 'guinea_rightshin',
            parent: 'rightLeg',
            layer: 5,
            scale: 0.1175,
            anchor: { mode: 'frame-fraction', x: 0.080078125, y: 0.7341092211280215 },
        },
        rightFoot: {
            frame: 'guinea_rightfoot',
            parent: 'rightShin',
            layer: 5,
            scale: 0.1,
            anchor: { mode: 'pixel', x: 226, y: 918 },
        },
        rightShoulder: {
            frame: 'guinea_rightshoulder',
            parent: 'torso',
            layer: 6,
            scale: 0.1,
            anchor: { mode: 'source-px', x: 1615, y: 170 },
        },
        rightArm: {
            frame: 'guinea_rightarm',
            parent: 'rightShoulder',
            layer: 6,
            scale: 0.1,
            anchor: { mode: 'source-px', x: 1501, y: 489 },
        },
        rightHand: {
            frame: 'guinea_righthand',
            parent: 'rightArm',
            layer: 6,
            scale: 0.1,
            anchor: { mode: 'source-px', x: 1727, y: 621 },
        },
    },
};

// ─────────────────────────────────────────────────────────────────────────────
class GuineaPigHero extends Phaser.GameObjects.Container {

    constructor(scene, x, y) {
        super(scene, x, y);
        scene.add.existing(this);
        this._buildPuppet();
    }

    _buildPuppet() {
        const def = GUINEA_PIG_PUPPET_DEF;
        const { parts, staticPose, output, atlasKey } = def;
        const { anchorX: rootAnchorX, anchorY: rootAnchorY } = output;
        const scene = this.scene;

        // ── Helpers ───────────────────────────────────────────────────────────

        /**
         * Return the anchor-pixel offset in screen units: how far the joint/pivot
         * sits from the sprite's top-left corner after scaling.
         *
         * Matches resolveAnchorPixels() in build-guinea-puppet.js:
         *   'frame-fraction' → frame.w * anchor.x * scale
         *   'source-px'      → anchor.x * scale  (raw source pixels × scale)
         *   'pixel'          → anchor.x * scale  (treated identically to source-px)
         */
        const anchorPxOf = (part) => {
            const frame = scene.textures.getFrame(atlasKey, part.frame);
            const { anchor, scale } = part;
            if (anchor.mode === 'frame-fraction') {
                return {
                    x: frame.realWidth * anchor.x * scale,
                    y: frame.realHeight * anchor.y * scale,
                };
            }
            // 'source-px' or 'pixel': anchor coords are in canvas/source pixels
            return {
                x: anchor.x * scale,
                y: anchor.y * scale,
            };
        };

        // ── Phase 0: resolve every part's joint anchor in root-local space ────
        //
        // jointPt[name] = position of the part's pivot relative to this container.
        // Derived from staticPose top-left + anchorPx so the result matches the
        // reference image produced by build-guinea-puppet.js.

        const jointPt = {};

        for (const [name, part] of Object.entries(parts)) {
            const ap = anchorPxOf(part);
            const sp = staticPose[name];
            jointPt[name] = {
                x: (sp.x - rootAnchorX) + ap.x,
                y: (sp.y - rootAnchorY) + ap.y,
            };
        }

        // ── Phase 1 & 2: build hierarchy and add sprites in layer order ────────
        //
        // Parts are processed in ascending layer order.  For each part:
        //   • getOrCreateJoint() lazily creates the joint Container and wires it
        //     to its parent Container (recursing up the tree if needed).
        //   • The sprite image is then appended to that Container.
        //
        // Because siblings are appended in layer order, Phaser's sequential
        // rendering gives the correct back-to-front z-ordering automatically.

        this.joints = {};

        const getOrCreateJoint = (name) => {
            if (this.joints[name]) return this.joints[name];

            const part = parts[name];
            const jp   = jointPt[name];

            // Recursively ensure the parent exists first.
            if (part.parent !== null) {
                getOrCreateJoint(part.parent);
            }

            // Position relative to parent joint (or to this container for root).
            let posX, posY;
            if (part.parent === null) {
                posX = jp.x;
                posY = jp.y;
            } else {
                const pjp = jointPt[part.parent];
                posX = jp.x - pjp.x;
                posY = jp.y - pjp.y;
            }

            const container = new Phaser.GameObjects.Container(scene, posX, posY);
            this.joints[name] = container;

            if (part.parent === null) {
                this.add(container);
            } else {
                this.joints[part.parent].add(container);
            }

            return container;
        };

        // Sort parts back-to-front by layer so each add() call preserves z-order.
        const sortedParts = Object.entries(parts)
            .sort((a, b) => a[1].layer - b[1].layer);

        for (const [name, part] of sortedParts) {
            const joint = getOrCreateJoint(name);
            const ap    = anchorPxOf(part);

            // Place the sprite so its pivot aligns with the container's origin.
            const img = scene.make.image({
                x:     -ap.x,
                y:     -ap.y,
                key:   atlasKey,
                frame: part.frame,
                add:   false,
            }).setOrigin(0, 0).setScale(part.scale);

            joint.add(img);
        }
    }

    /**
     * Flip the whole puppet to face a direction.
     * @param {'left'|'right'} direction
     */
    setFacing(direction) {
        this.setScale(direction === 'left' ? -1 : 1, 1);
    }
}
