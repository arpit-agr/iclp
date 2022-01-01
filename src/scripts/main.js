"registerProperty"in CSS && (CSS.registerProperty({
    name: "--border-thin",
    syntax: "<length>",
    inherits: !0,
    initialValue: "2px"
}),
CSS.registerProperty({
    name: "--primary-text-color",
    syntax: "<color>",
    inherits: !0,
    initialValue: "#050505"
})),

"paintWorklet"in CSS && CSS.paintWorklet.addModule("/scripts/image-cross.js"),

function() {
    const e = document.querySelector(".primary-nav-toggle");
    document.querySelector(".primary-nav");
    e && e.addEventListener("click", function() {
        let t = "true" === e.getAttribute("aria-expanded");
        e.setAttribute("aria-expanded", !t)
    })
}();
