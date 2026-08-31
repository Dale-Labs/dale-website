document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

const relationNotes = document.querySelectorAll("[data-relation-note]");
if (relationNotes.length) {
  relationNotes[0].classList.add("is-active");
}

document.querySelectorAll("[data-relation]").forEach(button => {
  button.addEventListener("click", () => {
    const id = button.dataset.relation;
    document.querySelectorAll("[data-relation]").forEach(item => {
      item.classList.toggle("is-active", item === button);
    });
    relationNotes.forEach(note => {
      note.classList.toggle("is-active", note.dataset.relationNote === id);
    });
  });
});

const carrierAnswer = document.querySelector("[data-carrier-answer]");
document.querySelectorAll("[data-carrier-example]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-carrier-example]").forEach(item => {
      item.classList.toggle("is-active", item === button);
    });
    carrierAnswer.textContent = "Depends who you ask.";
  });
});
