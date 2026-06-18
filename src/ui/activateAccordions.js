export default function activateAccordions() {
    for (var sectionHeader of document.querySelectorAll("#options b")) {
        sectionHeader.addEventListener("click", function() {
            var correspondingSection = document.getElementById(this.innerText.replaceAll(" ", "_"));
            if (correspondingSection.style.display == "none") correspondingSection.style.display = "block";
            else correspondingSection.style.display = "none";
            if (this.style.color == "") this.style.color = "deepskyblue";
            else this.style.color = "";
        });
    }

    for (var section of document.querySelectorAll("#options div")) {
        section.style.display = "none";
    }
}