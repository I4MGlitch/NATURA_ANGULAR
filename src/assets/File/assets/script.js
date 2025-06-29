window.addEventListener('DOMContentLoaded', event => {

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        // Uncomment Below to persist sidebar toggle between refreshes
        // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        //     document.body.classList.toggle('sb-sidenav-toggled');
        // }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }

});


//BACK TO TOP BUTTON
let mybutton = document.getElementById("btn-back-to-top");

window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (
    document.body.scrollTop > 20 ||
    document.documentElement.scrollTop > 20
  ) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

mybutton.addEventListener("click", backToTop);

function backToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

//BACK TO TOP BUTTON END

const addParagraphBtn = document.getElementById('addParagraphBtn');
    const additionalParagraphs = document.getElementById('additionalParagraphs');
    const dynamicForm = document.getElementById('dynamicForm');
    let paragraphCount = 1; // Mulai dengan 1 untuk textarea pertama

    // Fungsi untuk menambahkan textarea baru
    function addParagraph() {
        paragraphCount++; // Tambah penghitung
        const newParagraph = document.createElement('div'); // Buat elemen div
        newParagraph.classList.add('mb-3'); // Tambahkan kelas margin-bottom
        newParagraph.id = `paragraphContainer${paragraphCount}`; // Tambahkan ID unik

        newParagraph.innerHTML = `
            <label for="paragraph${paragraphCount}" class="form-label">Paragraph ${paragraphCount}</label>
            <textarea class="form-control" id="paragraph${paragraphCount}" name="paragraph${paragraphCount}" rows="3"></textarea>
            <button type="button" class="btn btn-danger btn-sm mt-2 removeParagraphBtn" data-paragraph="${paragraphCount}">Delete</button>
        `;
        additionalParagraphs.appendChild(newParagraph); // Tambahkan ke container
    }

    // Fungsi untuk menghapus textarea
    function removeParagraph(event) {
        if (event.target.classList.contains('removeParagraphBtn')) {
            const paragraphId = event.target.getAttribute('data-paragraph');
            const paragraphToRemove = document.getElementById(`paragraphContainer${paragraphId}`);
            if (paragraphToRemove) {
                paragraphToRemove.remove(); // Hapus elemen
            }
        }
    }

    // Event listener untuk tombol "Tambah Paragraf"
    addParagraphBtn.addEventListener('click', addParagraph);

    // Event delegation untuk tombol "Hapus"
    dynamicForm.addEventListener('click', removeParagraph);


// CHAT PAGE


// CHAT PAGE END

// ACTIVITIES PAGE
document.addEventListener('DOMContentLoaded', () => {
  // Ambil semua checkbox dan elemen progress bar
  const checkboxes = document.querySelectorAll('.checkbox');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text'); // Ambil elemen untuk teks persentase

  // Fungsi untuk memperbarui progress bar
  const updateProgressBar = () => {
      // Hitung jumlah checkbox total dan yang dicentang
      const totalCheckboxes = checkboxes.length;
      const checkedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;

      // Hitung persentase
      const percentage = Math.round((checkedCount / totalCheckboxes) * 100);

      // Perbarui lebar progress bar
      progressBar.style.width = `${percentage}%`;
      progressBar.setAttribute('aria-valuenow', percentage);

      // Perbarui teks persentase yang akan tampil di kolom col-md-2
      progressText.textContent = `${percentage}%`; // Update teks persentase
  };

  // Tambahkan event listener untuk setiap checkbox
  checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', updateProgressBar);
  });

  // Inisialisasi progress bar saat halaman dimuat
  updateProgressBar();
});

document.addEventListener('DOMContentLoaded', () => {
  const dropdownMenus = document.querySelectorAll('.dropdown-menu.keep-open');

  dropdownMenus.forEach(menu => {
      menu.addEventListener('click', (e) => {
          e.stopPropagation(); // Mencegah penutupan dropdown saat diklik
      });
  });
});

