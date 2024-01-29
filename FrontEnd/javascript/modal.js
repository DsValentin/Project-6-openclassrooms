
// Récupérer les références aux éléments nécessaires
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");
const modalPhoto = document.getElementById("modal-photo");
const modalClose = document.getElementById("modal-close");
const modalPhotoClose = document.getElementById("modal-photo-close");

// Fonction pour afficher la modal
function showModal() {
  modal.style.display = "block";
}

// Fonction pour masquer la modal
function hideModal() {
  modal.style.display = "none";
  resetImagePreview(); // Réinitialiser la prévisualisation de l'image
}

// Fonction pour réinitialiser la prévisualisation de l'image
function resetImagePreview() {
  const imgPreview = document
    .getElementById("form-photo-div")
    .querySelector("img");
  if (imgPreview) {
    imgPreview.remove();
  }

  // Réinitialiser la visibilité des autres éléments liés à la prévisualisation de l'image
  const labelImage = document.getElementById("label-image");
  const pImage = document.querySelector("#form-photo-div > p");
  const iModalImage = document.querySelector("#iModalImage");

  if (labelImage && pImage && iModalImage) {
    labelImage.style.display = "block";
    pImage.style.display = "block";
    iModalImage.style.display = "block";
  }
}

// Écouter les événements de fermeture de la modal
modalClose.addEventListener("click", hideModal);
modalPhotoClose.addEventListener("click", hideModal);
modalContent.addEventListener("click", function (e) {
  e.stopPropagation();
});
modalPhoto.addEventListener("click", function (e) {
  e.stopPropagation();
});

modalClose.addEventListener("click", hideModal);

modal.addEventListener("click", hideModal);

//Add photo button//

const newPhotoBtn = document.querySelector("#new-photo");
const returnBtn = document.querySelector("#modal-return");

newPhotoBtn.addEventListener("click", function () {
  modalContent.style.display = "none";
  modalPhoto.style.display = "block";
});

returnBtn.addEventListener("click", function () {
  modalContent.style.display = "flex";
  modalPhoto.style.display = "none";
});

modalPhotoClose.addEventListener("click", hideModal);

//ADD WORKS TO THE MODAL//

const imagesModalContainer = document.querySelector(".gallery-modal");

function createModalWorkFigure(work) {
  const figure = document.createElement("figure");
  const figureCaption = document.createElement("figcaption");
  const figureImage = document.createElement("img");
  const deleteIcon = document.createElement("i");

  figureImage.src = work.imageUrl;
  figureImage.alt = work.title;
  figureCaption.innerHTML = "";
  figure.setAttribute("data-id", work.id); // Add a data-id attribute to store the work ID
  deleteIcon.className = "fa-regular fa-trash-can";

  figure.appendChild(figureImage);
  figure.appendChild(figureCaption);
  figure.appendChild(deleteIcon);

  // Add a delete event when clicking on the "delete" icon
  deleteIcon.addEventListener("click", (event) => {
    event.preventDefault();
    deleteWorkById(work.id);
  });

  return figure;
}

fetch("http://localhost:5678/api/works")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((work) => {
      const figure = createModalWorkFigure(work);
      imagesModalContainer.appendChild(figure);
    });
  });

//DELETE WORK//

function deleteWorkById(workId) {
  const token = sessionStorage.getItem("Token");

  fetch(`http://localhost:5678/api/works/${workId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new error("La supression du travai à echoué.");
      }
      const modalWorkToRemove = document.querySelector(
        `figure[data-id="${workId}"]`
      );
      if (modalWorkToRemove) {
        modalWorkToRemove.remove();

        const galleryWorkToRemove = document.querySelector(
          `figure[data-id="${workId}"]`
        );
        if (galleryWorkToRemove) {
          galleryWorkToRemove.remove();
        } else {
          console.error(
            "Élément à supprimer non trouvé dans la galerie principale"
          );
        }
      } else {
        console.error("Élément à supprimer non trouvé dans la modale");
      }
    })
    .catch((error) => console.error(error));
}

//Delete all gallery//

function deleteGallery() {
  const token = sessionStorage.getItem("Token");
  const galleryWorks = document.querySelectorAll(
    ".gallery-modal figure, .gallery figure"
  );
  galleryWorks.forEach((galleryWork) => {
    const workId = galleryWork.getAttribute("data-id");
    fetch(`http://localhost:5678/api/works/${workId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    galleryWork.remove();
  });
}

document
  .getElementById("delete-gallery")
  .addEventListener("click", function () {
    const confirmation = confirm(
      "Êtes-vous sûr de vouloir supprimer la galerie ?"
    );
    if (confirmation) {
      deleteGallery();
    }
  });

//Check form filled//

const titleInput = document.getElementById("modal-photo-title");
const categorySelect = document.getElementById("modal-photo-category");
const imageInput = document.getElementById("image");
const submitButton = document.getElementById("modal-valider");

function checkForm() {
  if (
    titleInput.value !== "" &&
    categorySelect.value !== "" &&
    imageInput.value !== ""
  ) {
    submitButton.style.backgroundColor = "#1D6154";
  } else {
    submitButton.style.backgroundColor = "";
  }
}

titleInput.addEventListener("input", checkForm);
categorySelect.addEventListener("change", checkForm);
imageInput.addEventListener("change", checkForm);

//ADD NEW WORK//

const btnValider = document.getElementById("modal-valider");
btnValider.addEventListener("click", addNewWork);

function addNewWork(event) {
  event.preventDefault();

  const token = sessionStorage.getItem("Token");

  const title = document.getElementById("modal-photo-title").value;
  const category = document.getElementById("modal-photo-category").value;
  const image = document.getElementById("image").files[0];

  if (!title || !category || !image) {
    return;
  }

  //check if the image does not exceed 4mo//
  if (image.size > 4 * 1024 * 1024) {
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("category", category);
  formData.append("image", image);

  fetch("http://localhost:5678/api/works", {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((work) => {
      //create and add the new work to the gallery//
      const figure = createWorkFigure(work);
      const gallery = document.querySelector(".gallery");
      gallery.appendChild(figure);

      //create and add the new work to the modal gallery//
      const figureModal = createModalWorkFigure(work);
      const galleryModal = document.querySelector(".gallery-modal");
      galleryModal.appendChild(figureModal);
    })
    .catch((error) => console.error(error));
}

//PREVIEW IMG//
const inputImage = document.getElementById("image");
const labelImage = document.getElementById("label-image");
const pImage = document.querySelector("#form-photo-div > p");
const iconeImage = document.querySelector("#iModalImage");

inputImage.addEventListener("change", function () {
  const selectedImage = inputImage.files[0];

  const imgPreview = document.createElement("img");
  imgPreview.src = URL.createObjectURL(selectedImage);
  imgPreview.style.maxHeight = "100%";
  imgPreview.style.width = "auto";

  labelImage.style.display = "none";
  pImage.style.display = "none";
  inputImage.style.display = "none";
  iModalImage.style.display = "none";
  document.getElementById("form-photo-div").appendChild(imgPreview);
});
