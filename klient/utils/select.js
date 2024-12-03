// functions for HTML's select element

export function populateSelectFromList(selectElement, list){
    selectElement.innerHTML = '';
    list.forEach(listValue => {
        let option = document.createElement('option');
        option.value = listValue;
        option.innerText = listValue;
        selectElement.appendChild(option);
    });
}

