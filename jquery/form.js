$(document).ready(function () {

    const isEditing = localStorage.getItem("isEditing") === "true";
    const editEmployeeData = JSON.parse(localStorage.getItem("editEmployee"));

    if (isEditing && editEmployeeData) {
        $('#name').val(editEmployeeData.name);
        $(`input[name="gender"][value="${editEmployeeData.gender}"]`).prop("checked", true);
        $(`input[name="profile"][value="${editEmployeeData.profilePic}"]`).prop("checked", true);

        editEmployeeData.department.forEach(dep => {
            $(`input[name="department"][value="${dep}"]`).prop("checked", true);
        });

        $('#salary').val(editEmployeeData.salary);
        $('#notes').val(editEmployeeData.notes);

        if (editEmployeeData.startDate) {
            const [day, month, year] = editEmployeeData.startDate.split("-");
            $('select[name="day"]').val(day);

            const monthMap = {
                "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
                "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
            };
            const monthName = monthMap[month];
            $('select[name="month"]').val(monthName);
            $('select[name="year"]').val(year);
        }
    }

    function getFormattedStartDate() {
        const day = $('select[name="day"]').val();
        const monthName = $('select[name="month"]').val();
        const year = $('select[name="year"]').val();

        if (!day || !monthName || !year || day === "Day" || monthName === "Month" || year === "Year") {
            return "";
        }

        const monthMap = {
            Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
            Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
        };

        const month = monthMap[monthName];
        const formattedDay = day.padStart(2, '0');

        return `${formattedDay}-${month}-${year}`;
    }

    function showError(inputElement, message) {
        const wrapper = inputElement.closest('.input-wrapper').length
            ? inputElement.closest('.input-wrapper')
            : inputElement.closest('.form-group');

        if (inputElement.attr('type') === 'radio' || inputElement.attr('type') === 'checkbox') {
            inputElement.closest('.form-options').addClass("input-error");
            wrapper.find(".error-message").remove();
            wrapper.append(`<div class="error-message">${message}</div>`);
        } else {
            inputElement.addClass("input-error");
            wrapper.find(".error-message").remove();
            wrapper.append(`<div class="error-message">${message}</div>`);
        }
    }

    function clearError(inputElement) {
        const wrapper = inputElement.closest('.input-wrapper').length
            ? inputElement.closest('.input-wrapper')
            : inputElement.closest('.form-group');

        if (inputElement.attr('type') === 'radio' || inputElement.attr('type') === 'checkbox') {
            inputElement.closest('.form-options').removeClass("input-error");
        } else {
            inputElement.removeClass("input-error");
        }
        wrapper.find(".error-message").remove();
    }

    function validateForm() {
        let isValid = true;

        const nameInput = $('#name');
        const nameRegex = /^[a-zA-Z\s]{2,}$/;
        if (!nameRegex.test(nameInput.val())) {
            showError(nameInput, "This is a required question");
            isValid = false;
        } else {
            clearError(nameInput);
        }

        const profileInputs = $('input[name="profile"]');
        if ($('input[name="profile"]:checked').length === 0) {
            showError(profileInputs.first(), "This is a required question");
            isValid = false;
        } else {
            clearError(profileInputs.first());
        }

        const genderInputs = $('input[name="gender"]');
        if ($('input[name="gender"]:checked').length === 0) {
            showError(genderInputs.first(), "This is a required question");
            isValid = false;
        } else {
            clearError(genderInputs.first());
        }

        const departmentInputs = $('input[name="department"]');
        if ($('input[name="department"]:checked').length === 0) {
            showError(departmentInputs.first(), "This is a required question");
            isValid = false;
        } else {
            clearError(departmentInputs.first());
        }

        const salarySelect = $('#salary');
        if (!salarySelect.val()) {
            showError(salarySelect, "This is a required question");
            isValid = false;
        } else {
            clearError(salarySelect);
        }

        const dateSelect = $('select[name="year"]');
        if (getFormattedStartDate() === "") {
            showError(dateSelect, "This is a required question");
            isValid = false;
        } else {
            clearError(dateSelect);
        }

        return isValid;
    }

    $('#payroll').on('submit', function (e) {
        e.preventDefault();
        if (!validateForm()) return;

        const employeeData = {
            profilePic: $('input[name="profile"]:checked').val(),
            name: $('#name').val(),
            gender: $('input[name="gender"]:checked').val(),
            department: $('input[name="department"]:checked').map(function () {
                return this.value;
            }).get(),
            salary: $('#salary').val(),
            startDate: getFormattedStartDate(),
            notes: $('#notes').val()
        };

        if (isEditing && editEmployeeData?.id) {
            $.ajax({
                url: `http://localhost:3000/employees/${editEmployeeData.id}`,
                type: 'PUT',
                data: JSON.stringify(employeeData),
                contentType: 'application/json',
                success: function () {
                    alert('Employee updated successfully!');
                    localStorage.removeItem("isEditing");
                    localStorage.removeItem("editEmployee");
                    window.location.href = 'EmployeeDashboard.html';
                },
                error: function (err) {
                    console.error("Update failed", err);
                    alert("Failed to update employee.");
                }
            });
        } else {
            $.ajax({
                url: 'http://localhost:3000/employees',
                type: 'POST',
                data: JSON.stringify(employeeData),
                contentType: 'application/json',
                success: function () {
                    alert('Employee added successfully!');
                    window.location.href = 'EmployeeDashboard.html';
                },
                error: function (xhr, status, error) {
                    console.error('Error:', error);
                    alert('Failed to add employee.');
                }
            });
        }
    });

    window.onbeforeunload = () => {
        localStorage.removeItem("isEditing");
        localStorage.removeItem("editEmployee");
    };

  $('button[type="reset"]').on('click', function () {
    // Remove all error messages
    $('.error-message').remove();

    // Remove error styles
    $('.input-error').removeClass('input-error');
    $('input, select, textarea').removeClass('input-error');
  });

});
