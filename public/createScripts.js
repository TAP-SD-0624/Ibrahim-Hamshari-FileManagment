document.addEventListener('DOMContentLoaded', () => {
    const typeSelect = document.getElementById('type');
    const dataField = document.getElementById('data').parentElement;

    typeSelect.addEventListener('change', function () {
        if (this.value === 'dir') {
            dataField.style.display = 'none';
        } else {
            dataField.style.display = 'block';
        }
    });
});
