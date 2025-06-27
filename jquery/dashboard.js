// Make it global so all functions (like editEmployee) can access it
let allEmployees = [];

$(document).ready(function () {
    console.log("Dashboard JS is working!");

    // Redirect to form page on Add User click
    $("#addUser").on("click", function () {
        window.location.href = "EmployeePayroolForm.html";
    });

    // Toggle search input visibility with animation
    $(".search-button").on("click", function () {
        const $searchInput = $("#searchInput");
        $searchInput.toggleClass("visible");

        if ($searchInput.hasClass("visible")) {
            $searchInput.css({ display: 'inline-block' });
            setTimeout(() => $searchInput.addClass("slide-in"), 10);
            $searchInput.focus();
        } else {
            $searchInput.removeClass("slide-in");
            setTimeout(() => $searchInput.css({ display: 'none' }), 400);
            $searchInput.val('');
            renderTable(allEmployees); // Reset full table
        }
    });

    // Fetch employee data from JSON Server
    $.get("http://localhost:3000/employees", function (employees) {
        allEmployees = employees;
        renderTable(allEmployees);
    });

    // Filter employees by name when typing
    $("#searchInput").on("input", function () {
        const query = $(this).val().toLowerCase();
        const filtered = allEmployees.filter(emp =>
            emp.name.toLowerCase().includes(query)
        );
        renderTable(filtered);
    });

    // Delete employee from table and JSON server
    $(document).on("click", ".delete-btn", function () {
        const id = $(this).data("id");

        if (confirm("Are you sure you want to delete this employee?")) {
            $.ajax({
                url: `http://localhost:3000/employees/${id}`,
                type: 'DELETE',
                success: function () {
                    $(`#row-${id}`).remove();
                    allEmployees = allEmployees.filter(emp => emp.id !== id);
                    console.log(`Employee with ID ${id} deleted.`);
                },
                error: function (err) {
                    console.error("Failed to delete employee:", err);
                    alert("Error deleting employee.");
                }
            });
        }
    });
});

// Render the table rows
function renderTable(employeeList) {
    $("#employee-table-body").empty();
    employeeList.forEach(emp => {
        $("#employee-table-body").append(generateEmployeeRow(emp));
    });
}

// Generate each employee row
function generateEmployeeRow(emp) {
    const profileImgMap = {
        img1: "https://randomuser.me/api/portraits/men/81.jpg",
        img2: "https://randomuser.me/api/portraits/women/76.jpg",
        img3: "https://randomuser.me/api/portraits/men/97.jpg",
        img4: "https://randomuser.me/api/portraits/women/43.jpg"
    };

    const departmentBadges = emp.department.map(dep =>
        `<span class="department-tag">${dep}</span>`).join(' ');

    return `
    <tr id="row-${emp.id}">
      <td><img src="${profileImgMap[emp.profilePic]}" alt="Profile" class="profile-image" /></td>
      <td>${emp.name}</td>
      <td>${emp.gender}</td>
      <td>${departmentBadges}</td>
      <td>₹ ${emp.salary}</td>
      <td>${emp.startDate}</td>
      <td id="action-button-cell">
        <button class="action-button" onclick="editEmployee('${emp.id}')">
          <span class="material-icons edit-icon" aria-hidden="true">edit</span>
        </button>
        <button class="action-button delete-btn" data-id="${emp.id}">
          <span class="material-icons delete-icon" aria-hidden="true">delete</span>
        </button>
      </td>
    </tr>`;
}

// Edit functionality
function editEmployee(id) {
    const employee = allEmployees.find(emp => emp.id === id);
    if (!employee) return alert("Employee not found!");

    localStorage.setItem("editEmployee", JSON.stringify(employee));
    localStorage.setItem("isEditing", "true");
    window.location.href = "EmployeePayroolForm.html";
}

