/**
 * GuineaPigHero — Modular 2D puppet built from the guineaparts texture atlas.
 *
 * Constructor: new GuineaPigHero(scene, x, y)
 *   x, y  — screen position of the torso pivot (the character's body-center joint).
 *            Use setDepth() on the returned instance to control layering.
 *
 * Public properties after construction:
 *   .torsoNode  — Phaser.Container holding torso sprite + head sprite
 *   .torso      — torso Image
 *   .head       — head Image
 *   .farLeg     — Phaser.Container  (left leg group — back layer)
 *   .farArm     — Phaser.Container  (left arm group — back layer)
 *   .nearLeg    — Phaser.Container  (right leg group — front layer)
 *   .nearArm    — Phaser.Container  (right arm group — front layer)
 *
 * Public method:
 *   .setFacing('left' | 'right')  — mirrors the whole puppet on X
 */

// ─────────────────────────────────────────────────────────────────────────────
// JOINT CONFIG — all tunable offsets in screen pixels.
//
// The GuineaPigHero container's (0, 0) is the TORSO PIVOT — the atlas-defined
// joint at pixel (1108, 640) of the 2816×1536 canvas, rendered at SCALE_LARGE.
//
// Two canvas sizes live in the atlas:
//   Large 2816×1536 — torso, shoulders, arms, hands, feet  (scale = SCALE_LARGE)
//   Small 2048×1117 — head, upper-legs, shins             (scale = SCALE_SMALL)
//
// All offsets are RELATIVE TO THE TORSO PIVOT (container origin).
// ─────────────────────────────────────────────────────────────────────────────
const GUINEA_PIG_CONFIG = {

    // ── Scales ────────────────────────────────────────────────────────────────
    SCALE_LARGE : 0.10,    // 2816 → 281.6 px wide on screen
    SCALE_SMALL : 0.1175,  // 2048 → 240.6 px; corrects for different canvas viewport
                           // Derived: k = (657/559) × SCALE_LARGE ≈ 1.1753 × 0.10

    // ── Torso origin (atlas pivot fraction) ──────────────────────────────────
    // The torso sprite is placed at (0, 0) in the container using this origin,
    // so the torso's atlas pivot lands exactly at the container's (0, 0).
    TORSO_ORIGIN_X : 1108 / 2816,  // ≈ 0.3934
    TORSO_ORIGIN_Y : 640  / 1536,  // ≈ 0.4167

    // ── Head origin (atlas pivot fraction — chin/neck attachment) ─────────────
    // Placing origin near the bottom of the head keeps the chin on the neck socket.
    HEAD_ORIGIN_X : 232 / 2048,   // ≈ 0.1133  (atlas pivot x)
    HEAD_ORIGIN_Y : 396 / 1117,   // ≈ 0.3546  (atlas pivot y — chin)

    // ── Neck socket (where head chin attaches, torso-local px) ───────────────
    // Derived from small-canvas offset and head pivot measurement.
    NECK_X :  0.0,
    NECK_Y : -38.0,

    // ── Shoulder sockets (torso-local px, at top sides of torso) ─────────────
    SHOULDER_NEAR_X :  43.7,  // right shoulder — atlas right-shoulder pivot
    SHOULDER_NEAR_Y : -47.0,
    SHOULDER_FAR_X  : -30.8,  // left shoulder  — atlas left-shoulder pivot
    SHOULDER_FAR_Y  : -34.0,

    // ── Hip sockets (torso-local px, at bottom of torso) ─────────────────────
    HIP_NEAR_X : -11.2,  // right hip — atlas right-leg pivot mapped to torso-local
    HIP_NEAR_Y : -13.9,
    HIP_FAR_X  :  11.2,  // left hip
    HIP_FAR_Y  : -10.7,

    // ── Elbow sockets (shoulder-local px — where arm top connects) ───────────
    // Relative to each shoulder's proximal pivot.
    ELBOW_NEAR_X : -11.4,
    ELBOW_NEAR_Y :  31.9,
    ELBOW_FAR_X  :  -9.5,
    ELBOW_FAR_Y  :  28.7,

    // ── Wrist sockets (arm-local px — where hand top connects) ───────────────
    WRIST_NEAR_X :  22.6,
    WRIST_NEAR_Y :  13.2,
    WRIST_FAR_X  :  17.8,
    WRIST_FAR_Y  :  12.5,

    // ── Knee sockets (upper-leg-local px — where shin top connects) ──────────
    KNEE_NEAR_X :  3.2,
    KNEE_NEAR_Y : 25.8,
    KNEE_FAR_X  :  5.0,
    KNEE_FAR_Y  : 24.1,

    // ── Ankle sockets (shin-local px — where foot top connects) ──────────────
    // The foot sprites live on the large canvas; they are placed at FOOT_DX/DY
    // in main-container space rather than shin-local space because the two canvas
    // sizes have different scale systems.  The atlas fur artwork bridges the gap.
    ANKLE_NEAR_X :  3.8,
    ANKLE_NEAR_Y : 15.9,
    ANKLE_FAR_X  :  4.2,
    ANKLE_FAR_Y  : 15.6,

    // ── Absolute foot positions (main-container px) ───────────────────────────
    // Both feet share the same image-top-left offset.  foot_dx=84 shifts them
    // rightward from their raw canvas position to sit under the shins.
    FOOT_DX : -26.8,   // = -(torso_pivot_x × SCALE_LARGE) + 84
    FOOT_DY : -64.0,   // = -(torso_pivot_y × SCALE_LARGE)
};


// ─────────────────────────────────────────────────────────────────────────────
class GuineaPigHero extends Phaser.GameObjects.Container {

    constructor(scene, x, y) {
        super(scene, x, y);
        scene.add.existing(this);
        this._buildPuppet();
    }

    _buildPuppet() {
        const C  = GUINEA_PIG_CONFIG;
        const S  = C.SCALE_LARGE;
        const sS = C.SCALE_SMALL;

        // Offset so torso atlas-pivot lands at container (0,0)
        const B_DX = -(C.TORSO_ORIGIN_X * 2816 * S);   // ≈ -110.8
        const B_DY = -(C.TORSO_ORIGIN_Y * 1536 * S);   // ≈  -64.0

        // ── Part factories ────────────────────────────────────────────────────

        /**
         * Large-canvas (2816×1536) sprite.
         * dx/dy is the image top-left, in main-container space (torso-pivot-relative).
         */
        const mkL = (frame, dx = B_DX, dy = B_DY) =>
            this.scene.make.image({ x: dx, y: dy, key: 'guineaparts', frame, add: false })
                .setOrigin(0, 0)
                .setScale(S);

        /**
         * Small-canvas (2048×1117) sprite.
         * Origin set to the atlas pivot so the sprite rotates from its joint.
         * Placed via NECK_X/NECK_Y or HIP_X/HIP_Y socket when inside a joint container.
         */
        const mkS = (frame, ox, oy) =>
            this.scene.make.image({ x: 0, y: 0, key: 'guineaparts', frame, add: false })
                .setOrigin(ox, oy)
                .setScale(sS);

        /** Empty joint container (no scene registration). */
        const mkJoint = (x, y) => new Phaser.GameObjects.Container(this.scene, x, y);


        // ═════════════════════════════════════════════════════════════════════
        // HIERARCHY  (added to main container in back-to-front z-order)
        // ─────────────────────────────────────────────────────────────────────
        // Z-layer order:
        //   1. Far  Leg  (left)   — back-most
        //   2. Far  Arm  (left)
        //   3. Torso  +  Head
        //   4. Near Leg  (right)
        //   5. Near Arm  (right)  — front-most
        // ═════════════════════════════════════════════════════════════════════

        // ── 1. Far (left / background) Leg ───────────────────────────────────
        //   hipFar → legFar → kneeFar → shinFar → ankleFar → footFar
        this.farLeg = mkJoint(0, 0);

        const hipFar   = mkJoint(C.HIP_FAR_X,   C.HIP_FAR_Y);
        const kneeFar  = mkJoint(C.KNEE_FAR_X,  C.KNEE_FAR_Y);
        const ankleFar = mkJoint(C.ANKLE_FAR_X, C.ANKLE_FAR_Y);

        const legFar  = mkS('guinea_leftleg',   328 / 2048, 628 / 1117);  // hip pivot
        const shinFar = mkS('guinea_leftshin',  396 / 2048, 820 / 1117);  // knee pivot
        // Foot is large-canvas — anchored at absolute position, not shin-local
        const footFar = mkL('guinea_leftfoot',  C.FOOT_DX, C.FOOT_DY);

        ankleFar.add(footFar);
        kneeFar.add(shinFar);
        kneeFar.add(ankleFar);
        hipFar.add(legFar);
        hipFar.add(kneeFar);
        this.farLeg.add(hipFar);
        this.add(this.farLeg);


        // ── 2. Far (left / background) Arm ───────────────────────────────────
        //   shoulderFar → elbowFar → wristFar
        this.farArm = mkJoint(0, 0);

        const shoulderFarJoint = mkJoint(C.SHOULDER_FAR_X, C.SHOULDER_FAR_Y);
        const elbowFarJoint    = mkJoint(C.ELBOW_FAR_X,    C.ELBOW_FAR_Y);
        const wristFarJoint    = mkJoint(C.WRIST_FAR_X,    C.WRIST_FAR_Y);

        // Large-canvas arm parts: placed so their atlas pivots land at each joint
        const shoulderFarImg = this.scene.make.image({
            x: 0, y: 0, key: 'guineaparts', frame: 'guinea_leftshoulder', add: false
        }).setOrigin(2290 / 2816, 170 / 1536).setScale(S);

        const armFarImg = this.scene.make.image({
            x: 0, y: 0, key: 'guineaparts', frame: 'guinea_leftarm', add: false
        }).setOrigin(2478 / 2816, 433 / 1536).setScale(S);

        const handFarImg = this.scene.make.image({
            x: 0, y: 0, key: 'guineaparts', frame: 'guinea_lefthand', add: false
        }).setOrigin(2647 / 2816, 621 / 1536).setScale(S);

        wristFarJoint.add(handFarImg);
        elbowFarJoint.add(armFarImg);
        elbowFarJoint.add(wristFarJoint);
        shoulderFarJoint.add(shoulderFarImg);
        shoulderFarJoint.add(elbowFarJoint);
        this.farArm.add(shoulderFarJoint);
        this.add(this.farArm);


        // ── 3. Torso — Head is a child of Torso ──────────────────────────────
        this.torsoNode = mkJoint(0, 0);

        this.torso = mkL('guinea_torso');   // placed so atlas-pivot = (0,0)
        this.torsoNode.add(this.torso);

        // Head: origin = chin/atlas-pivot; placed at neck socket
        const headJoint = mkJoint(C.NECK_X, C.NECK_Y);
        this.head = mkS('guinea_head', 232 / 2048, 396 / 1117);  // origin = chin
        headJoint.add(this.head);
        this.torsoNode.add(headJoint);

        this.add(this.torsoNode);


        // ── 4. Near (right / foreground) Leg ─────────────────────────────────
        //   hipNear → legNear → kneeNear → shinNear → ankleNear → footNear
        this.nearLeg = mkJoint(0, 0);

        const hipNear   = mkJoint(C.HIP_NEAR_X,   C.HIP_NEAR_Y);
        const kneeNear  = mkJoint(C.KNEE_NEAR_X,  C.KNEE_NEAR_Y);
        const ankleNear = mkJoint(C.ANKLE_NEAR_X, C.ANKLE_NEAR_Y);

        const legNear  = mkS('guinea_rightleg',  137 / 2048, 601 / 1117);  // hip pivot
        const shinNear = mkS('guinea_rightshin', 164 / 2048, 820 / 1117);  // knee pivot
        const footNear = mkL('guinea_rightfoot', C.FOOT_DX, C.FOOT_DY);

        ankleNear.add(footNear);
        kneeNear.add(shinNear);
        kneeNear.add(ankleNear);
        hipNear.add(legNear);
        hipNear.add(kneeNear);
        this.nearLeg.add(hipNear);
        this.add(this.nearLeg);


        // ── 5. Near (right / foreground) Arm ─────────────────────────────────
        //   shoulderNear → elbowNear → wristNear
        this.nearArm = mkJoint(0, 0);

        const shoulderNearJoint = mkJoint(C.SHOULDER_NEAR_X, C.SHOULDER_NEAR_Y);
        const elbowNearJoint    = mkJoint(C.ELBOW_NEAR_X,    C.ELBOW_NEAR_Y);
        const wristNearJoint    = mkJoint(C.WRIST_NEAR_X,    C.WRIST_NEAR_Y);

        const shoulderNearImg = this.scene.make.image({
            x: 0, y: 0, key: 'guineaparts', frame: 'guinea_rightshoulder', add: false
        }).setOrigin(1615 / 2816, 170 / 1536).setScale(S);

        const armNearImg = this.scene.make.image({
            x: 0, y: 0, key: 'guineaparts', frame: 'guinea_rightarm', add: false
        }).setOrigin(1501 / 2816, 489 / 1536).setScale(S);

        const handNearImg = this.scene.make.image({
            x: 0, y: 0, key: 'guineaparts', frame: 'guinea_righthand', add: false
        }).setOrigin(1727 / 2816, 621 / 1536).setScale(S);

        wristNearJoint.add(handNearImg);
        elbowNearJoint.add(armNearImg);
        elbowNearJoint.add(wristNearJoint);
        shoulderNearJoint.add(shoulderNearImg);
        shoulderNearJoint.add(elbowNearJoint);
        this.nearArm.add(shoulderNearJoint);
        this.add(this.nearArm);
    }

    /**
     * Flip the whole puppet to face a direction.
     * @param {'left'|'right'} direction
     */
    setFacing(direction) {
        this.setScale(direction === 'left' ? -1 : 1, 1);
    }
}
