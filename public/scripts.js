function confirmDelete(fileName) {
    document.getElementById('deleteFileName').value = fileName;
    document.getElementById('deleteModal').style.display = 'block';
}

function changeName(fileName) {
    document.getElementById('oldFileName').value = fileName;
    document.getElementById('changeNameModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

document.getElementById('searchInput').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const query = this.value;
        sendSearchRequest(query);
    }
});

async function sendSearchRequest(query) {
    window.location = `/search?name=${query}`
}
async function deleteElement(event) {
    event.preventDefault();

    const form = document.getElementById('deleteForm');
    const formData = new FormData(form);
    const fileName = formData.get('name');
    const url = form.action;
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: fileName })
        });

        if (response.ok) {
            console.log('File deleted successfully');
            closeModal('deleteModal');
            location.reload(true)
        } else {
            console.error('Failed to delete file');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


async function patchElement(event) {
    event.preventDefault();

    const form = document.getElementById('changeNameForm');
    const formData = new FormData(form);
    const fileName = formData.get('name');
    const oldFileName = formData.get('oldName');
    const url = form.action;
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: fileName, oldName: oldFileName })
        });

        if (response.ok) {
            console.log('Named Updated successfully');
            closeModal('changeNameModal');
            location.reload(true)
        } else {
            console.error('Failed to Rename file');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}