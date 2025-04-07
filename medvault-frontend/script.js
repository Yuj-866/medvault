async function searchMedicine() {
    const input = document.getElementById("searchInput");
    const name = input.value.trim().toLowerCase();
    const infoDiv = document.getElementById("medicineInfo");
    infoDiv.innerHTML = "";
  
    if (!name) {
      infoDiv.innerHTML = "<p class='not-found'>Please enter a medicine name.</p>";
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3000/api/medicines");
      const medicines = await response.json();
  
      const match = medicines.find(med => med.name.toLowerCase() === name);
  
      if (!match) {
        infoDiv.innerHTML = "<p class='not-found'>Medicine not found.</p>";
        return;
      }
  
      infoDiv.innerHTML = `
        <div class="medicine-card">
          <h2>${match.name}</h2>
          ${match.image_url ? `<img src="${match.image_url}" alt="${match.name}">` : ""}
          <p><strong>Composition:</strong> ${match.composition || "N/A"}</p>
          <p><strong>Uses:</strong> ${match.uses || "N/A"}</p>
          <p><strong>Side Effects:</strong> ${match.side_effects || "N/A"}</p>
          <p><strong>Manufacturer:</strong> ${match.manufacturer || "N/A"}</p>
          <p><strong>Reviews:</strong><br>
            Excellent: ${match.excellent_review_percent}%<br>
            Average: ${match.average_review_percent}%<br>
            Poor: ${match.poor_review_percent}%
          </p>
        </div>
      `;
    } catch (err) {
      console.error("Error fetching medicine data:", err);
      infoDiv.innerHTML = "<p class='not-found'>Failed to load data. Please try again.</p>";
    }
  }
  