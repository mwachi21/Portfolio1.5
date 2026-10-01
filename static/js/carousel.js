
(() => {

    "use strict";


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const carousel =
        document.getElementById("carousel");

    const cards =
        Array.from(
            document.querySelectorAll(".card")
        );


    const total =
        cards.length;


    /* =====================================================
       CAROUSEL STATE
    ===================================================== */

    /*
     * position is NOT an integer.
     *
     * Example:
     *
     * 0     = first card centered
     * 0.5   = halfway between cards
     * 1     = second card centered
     *
     * This is what makes the movement fluid.
     */

    let position = 0;

    let targetPosition = 0;

    let velocity = 0;


    /* =====================================================
       DRAG STATE
    ===================================================== */

    let dragging = false;

    let lastPointerX = 0;

    let pointerVelocity = 0;


    /* =====================================================
       SETTINGS
    ===================================================== */

    /*
     * Number of degrees between cards.
     *
     * Smaller = flatter arc.
     *
     * Larger = stronger arc.
     */

    const ANGLE_STEP = 13;


    /*
     * Radius of the carousel.
     *
     * Larger = flatter.
     *
     * Smaller = deeper arc.
     */

    const RADIUS_X = 1180;

    const RADIUS_Y = 470;


    /*
     * Distance represented by one card.
     */

    const CARD_DISTANCE = 255;


    /*
     * How much the cards scale
     * toward the edges.
     */

    const EDGE_SCALE = 0.08;


    /* =====================================================
       NORMALIZE
    ===================================================== */

    function normalize(value) {

        value %= total;

        if (value < 0) {
            value += total;
        }

        return value;
    }


    /* =====================================================
       SHORTEST OFFSET
    ===================================================== */

    function getOffset(index) {

        let offset =
            index - position;


        /*
         * Wrap around.
         */

        while (offset > total / 2) {

            offset -= total;

        }


        while (offset < -total / 2) {

            offset += total;

        }


        return offset;
    }


    /* =====================================================
       RENDER
    ===================================================== */

    function render() {

        cards.forEach((card, index) => {

            const offset =
                getOffset(index);


            /*
             * Convert card distance
             * into an angle.
             *
             * Center card:
             *
             * angle = 0
             *
             * Therefore rotation = 0.
             */

            const angle =
                offset * ANGLE_STEP;


            const radians =
                angle * Math.PI / 180;


            /* =================================================
               ARC POSITION
            ================================================= */

            /*
             * Circular/elliptical arc.
             *
             * sin gives horizontal movement.
             *
             * cos gives vertical movement.
             */

            const x =
                Math.sin(radians) *
                RADIUS_X;


            const y =
                RADIUS_Y -
                Math.cos(radians) *
                RADIUS_Y;


            /*
             * Move the entire arc upward.
             */

            const verticalOffset =
                -25;


            const finalY =
                y + verticalOffset;


            /* =================================================
               ROTATION
            ================================================= */

            /*
             * This is the important part.
             *
             * The card at the center has:
             *
             * angle = 0
             * rotation = 0
             *
             * So the center card is ALWAYS straight.
             */

            const rotation =
                angle;


            /* =================================================
               SCALE
            ================================================= */

            const distance =
                Math.abs(offset);


            const scale =
                Math.max(
                    0.84,
                    1 -
                    distance * EDGE_SCALE
                );


            /* =================================================
               OPACITY
            ================================================= */

            const opacity =
                Math.max(
                    0.45,
                    1 -
                    distance * 0.12
                );


            /* =================================================
               APPLY
            ================================================= */

            card.style.transform =

                `
                translate(
                    calc(-50% + ${x}px),
                    calc(-50% + ${finalY}px)
                )
                rotate(${rotation}deg)
                scale(${scale})
                `;


            card.style.opacity =
                opacity;


            /*
             * Center cards appear
             * above outer cards.
             */

            card.style.zIndex =
                1000 -
                Math.round(
                    distance * 100
                );

        });

    }


    /* =====================================================
       ANIMATION LOOP
    ===================================================== */

    function animate() {


        /*
         * When not dragging,
         * smoothly follow the target.
         */

        if (!dragging) {

            const difference =
                targetPosition - position;


            /*
             * Spring-like movement.
             */

            velocity +=
                difference * 0.075;


            velocity *= 0.78;


            position += velocity;

        }


        render();


        requestAnimationFrame(
            animate
        );

    }


    animate();



    /* =====================================================
       POINTER DOWN
    ===================================================== */

    carousel.addEventListener(
        "pointerdown",
        event => {

            dragging = true;


            carousel.classList.add(
                "dragging"
            );


            lastPointerX =
                event.clientX;


            pointerVelocity = 0;


            /*
             * Stop current momentum.
             */

            velocity = 0;


            carousel.setPointerCapture(
                event.pointerId
            );

        }
    );



    /* =====================================================
       POINTER MOVE
    ===================================================== */

    carousel.addEventListener(
        "pointermove",
        event => {

            if (!dragging) {
                return;
            }


            const currentX =
                event.clientX;


            const delta =
                currentX -
                lastPointerX;


            lastPointerX =
                currentX;


            /*
             * Remember movement velocity.
             */

            pointerVelocity =
                delta / CARD_DISTANCE;


            /*
             * Move carousel.
             *
             * Drag right:
             * cards move right.
             *
             * Drag left:
             * cards move left.
             */

            position -=
                delta / CARD_DISTANCE;


            targetPosition =
                position;

        }
    );



    /* =====================================================
       POINTER UP
    ===================================================== */

    function release() {

        if (!dragging) {
            return;
        }


        dragging = false;


        carousel.classList.remove(
            "dragging"
        );


        /*
         * Add momentum.
         */

        targetPosition =
            position -
            pointerVelocity * 2.2;


        /*
         * Find nearest card.
         */

        const nearest =
            Math.round(
                targetPosition
            );


        targetPosition =
            nearest;

    }


    carousel.addEventListener(
        "pointerup",
        release
    );


    carousel.addEventListener(
        "pointercancel",
        release
    );



    /* =====================================================
       WHEEL
    ===================================================== */

    carousel.addEventListener(
        "wheel",
        event => {

            event.preventDefault();


            /*
             * Small movement.
             */

            const movement =
                event.deltaY > 0
                    ? 0.45
                    : -0.45;


            targetPosition +=
                movement;


            /*
             * Keep target near
             * current position.
             */

            targetPosition =
                position +
                movement;

        },
        {
            passive: false
        }
    );



    /* =====================================================
       RESIZE
    ===================================================== */

    window.addEventListener(
        "resize",
        render
    );


})();
