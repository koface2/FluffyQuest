/**
 * GuineaPigHero - articulated guinea pig puppet assembled from guineaparts.
 *
 * All origins and joint offsets are derived mathematically from guineaparts.json:
 *
 *   setOrigin for source-px anchors:
 *     ox = anchor.x / atlasFrame.w   (NOT source canvas width!)
 *     oy = anchor.y / atlasFrame.h
 *     Large atlas frame = 1308 × 713, scale 0.1  → displayed 130.8 × 71.3 px
 *     Small atlas frame =  951 × 519, scale 0.1175 → displayed 111.7 × 61.0 px
 *
 *   setOrigin for frame-fraction anchors:
 *     ox/oy = the fraction values verbatim from the JSON
 *
 *   Joint offsets (canvas px = Phaser px at these scales):
 *     offset = child.anchorPoint - parent.anchorPoint
 *     anchorPoint = staticPose.topLeft + (anchor * scale)
 */

// Joint offsets pre-computed from guineaparts.json staticPose + anchor data.
// All values are Phaser pixels (= canvas pixels at scale 0.1 / 0.1175).
const GUINEA_PIG_RIG = {
    joints: {
        // relative to torso anchor (210, 190) in canvas space
        neck:          { x: -62.15, y: -54.38 },
        leftShoulder:  { x:  43.20, y: -38.00 },
        rightShoulder: { x:  47.70, y: -42.00 },
        leftHip:       { x: -66.90, y:  -4.71 },
        rightHip:      { x: -55.33, y:  -4.19 },
        // relative to leftShoulder anchor
        leftElbow:     { x:   6.80, y:  27.30 },
        // relative to leftArm anchor
        leftWrist:     { x:   5.90, y:  20.80 },
        // relative to rightShoulder anchor
        rightElbow:    { x:  -6.40, y:  28.90 },
        // relative to rightArm anchor
        rightWrist:    { x:  22.60, y:  16.20 },
        // relative to leftLeg anchor
        leftKnee:      { x:   3.71, y:   8.48 },
        // relative to leftShin anchor
        leftAnkle:     { x:  -5.01, y:  30.03 },
        // relative to rightLeg anchor
        rightKnee:     { x:   2.47, y:  10.96 },
        // relative to rightShin anchor
        rightAnkle:    { x:  10.65, y:  29.03 },
    },

    // Part definitions: frame name, draw scale, and pivot origin fractions.
    // ox/oy = anchor.x / atlasFrameWidth  (source-px parts)
    //       = frame-fraction value directly (small parts)
    parts: {
        // ── Large atlas frames 1308×713, scale 0.1 ────────────────────────
        torso:         { frame: 'guinea_torso',         scale: 0.1,    ox: 0.8471, oy: 0.8976 },
        leftShoulder:  { frame: 'guinea_leftshoulder',  scale: 0.1,    ox: 1.7508, oy: 0.2384 },
        leftArm:       { frame: 'guinea_leftarm',       scale: 0.1,    ox: 1.8945, oy: 0.6073 },
        leftHand:      { frame: 'guinea_lefthand',      scale: 0.1,    ox: 2.0237, oy: 0.8710 },
        rightShoulder: { frame: 'guinea_rightshoulder', scale: 0.1,    ox: 1.2347, oy: 0.2384 },
        rightArm:      { frame: 'guinea_rightarm',      scale: 0.1,    ox: 1.1476, oy: 0.6858 },
        rightHand:     { frame: 'guinea_righthand',     scale: 0.1,    ox: 1.3204, oy: 0.8710 },
        leftFoot:      { frame: 'guinea_leftfoot',      scale: 0.1,    ox: 0.1728, oy: 1.2875 },
        rightFoot:     { frame: 'guinea_rightfoot',     scale: 0.1,    ox: 0.1728, oy: 1.2875 },
        // ── Small atlas frames 951×519, scale 0.1175 ──────────────────────
        head:          { frame: 'guinea_head',          scale: 0.1175, ox: 0.11328125,    oy: 0.35452103849597134 },
        leftLeg:       { frame: 'guinea_leftleg',       scale: 0.1175, ox: 0.16015625,    oy: 0.5622202327663384  },
        leftShin:      { frame: 'guinea_leftshin',      scale: 0.1175, ox: 0.193359375,   oy: 0.7341092211280215  },
        rightLeg:      { frame: 'guinea_rightleg',      scale: 0.1175, ox: 0.06689453125, oy: 0.5380483437780662  },
        rightShin:     { frame: 'guinea_rightshin',     scale: 0.1175, ox: 0.080078125,   oy: 0.7341092211280215  },
    },
};

class GuineaPigHero extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        scene.add.existing(this);
        this._idleTweens = [];
        this._buildPuppet();
    }

    _makeJoint(x, y) {
        return new Phaser.GameObjects.Container(this.scene, x, y);
    }

    _makePart(def) {
        const img = this.scene.make.image({
            x: 0, y: 0,
            key: 'guineaparts',
            frame: def.frame,
            add: false,
        });
        img.setOrigin(def.ox, def.oy);
        img.setScale(def.scale);
        return img;
    }

    _buildPuppet() {
        const jd = GUINEA_PIG_RIG.joints;
        const pd = GUINEA_PIG_RIG.parts;

        // All limbs sit LEFT of and ABOVE the torso anchor in canvas space.
        // Visual figure centre is at Container-local (-72, -28).
        // Offset torso joint so that Container (0,0) == visual centre.
        const CX = 72, CY = 28;

        // Create all joint containers
        this.joints = {
            torso:         this._makeJoint(CX, CY),
            neck:          this._makeJoint(jd.neck.x,          jd.neck.y         ),
            leftShoulder:  this._makeJoint(jd.leftShoulder.x,  jd.leftShoulder.y ),
            leftElbow:     this._makeJoint(jd.leftElbow.x,     jd.leftElbow.y    ),
            leftWrist:     this._makeJoint(jd.leftWrist.x,     jd.leftWrist.y    ),
            rightShoulder: this._makeJoint(jd.rightShoulder.x, jd.rightShoulder.y),
            rightElbow:    this._makeJoint(jd.rightElbow.x,    jd.rightElbow.y   ),
            rightWrist:    this._makeJoint(jd.rightWrist.x,    jd.rightWrist.y   ),
            leftHip:       this._makeJoint(jd.leftHip.x,       jd.leftHip.y      ),
            leftKnee:      this._makeJoint(jd.leftKnee.x,      jd.leftKnee.y     ),
            leftAnkle:     this._makeJoint(jd.leftAnkle.x,     jd.leftAnkle.y    ),
            rightHip:      this._makeJoint(jd.rightHip.x,      jd.rightHip.y     ),
            rightKnee:     this._makeJoint(jd.rightKnee.x,     jd.rightKnee.y    ),
            rightAnkle:    this._makeJoint(jd.rightAnkle.x,    jd.rightAnkle.y   ),
        };

        // ── Arm chains ────────────────────────────────────────────────────
        this.joints.leftWrist.add(this._makePart(pd.leftHand));
        this.joints.leftElbow.add(this._makePart(pd.leftArm));
        this.joints.leftElbow.add(this.joints.leftWrist);
        this.joints.leftShoulder.add(this._makePart(pd.leftShoulder));
        this.joints.leftShoulder.add(this.joints.leftElbow);

        this.joints.rightWrist.add(this._makePart(pd.rightHand));
        this.joints.rightElbow.add(this._makePart(pd.rightArm));
        this.joints.rightElbow.add(this.joints.rightWrist);
        this.joints.rightShoulder.add(this._makePart(pd.rightShoulder));
        this.joints.rightShoulder.add(this.joints.rightElbow);

        // ── Leg chains ────────────────────────────────────────────────────
        this.joints.leftAnkle.add(this._makePart(pd.leftFoot));
        this.joints.leftKnee.add(this._makePart(pd.leftShin));
        this.joints.leftKnee.add(this.joints.leftAnkle);
        this.joints.leftHip.add(this._makePart(pd.leftLeg));
        this.joints.leftHip.add(this.joints.leftKnee);

        this.joints.rightAnkle.add(this._makePart(pd.rightFoot));
        this.joints.rightKnee.add(this._makePart(pd.rightShin));
        this.joints.rightKnee.add(this.joints.rightAnkle);
        this.joints.rightHip.add(this._makePart(pd.rightLeg));
        this.joints.rightHip.add(this.joints.rightKnee);

        // ── Head ──────────────────────────────────────────────────────────
        this.joints.neck.add(this._makePart(pd.head));

        // ── Assemble torso in layer order (back → front) ──────────────────
        // layer 1: left legs (far side, behind torso)
        this.joints.torso.add(this.joints.leftHip);
        // layer 2: left arm (far side, behind torso)
        this.joints.torso.add(this.joints.leftShoulder);
        // layer 3: torso body
        this.joints.torso.add(this._makePart(pd.torso));
        // layer 4: head
        this.joints.torso.add(this.joints.neck);
        // layer 5: right legs (near side, in front)
        this.joints.torso.add(this.joints.rightHip);
        // layer 6: right arm (near side, in front)
        this.joints.torso.add(this.joints.rightShoulder);

        this.add(this.joints.torso);
    }

    playIdleMotion() {
        this.stopIdleMotion();
        const push = (joint, delta, duration, delay = 0) => {
            if (!joint) return;
            const rest = joint.rotation;
            this._idleTweens.push(this.scene.tweens.add({
                targets: joint,
                rotation: rest + delta,
                duration,
                delay,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            }));
        };

        push(this.joints.torso,          0.03, 1700,   0);
        push(this.joints.neck,          -0.05, 1600, 140);
        push(this.joints.leftShoulder,   0.10, 1250,  40);
        push(this.joints.leftElbow,      0.06, 1000, 120);
        push(this.joints.rightShoulder, -0.08, 1250,  90);
        push(this.joints.rightElbow,     0.06, 1000, 170);
        push(this.joints.leftHip,        0.06, 1500, 100);
        push(this.joints.rightHip,      -0.06, 1500, 220);
    }

    stopIdleMotion() {
        for (const t of this._idleTweens) t.stop();
        this._idleTweens = [];
    }

    setFacing(direction) {
        this.setScale(direction === 'left' ? -1 : 1, 1);
    }
}
