const ygui = {
    buildGUIsection: function (fields, container=document.body) {
        var inputs_out = {};
    
        var table = document.createElement("table");
        container.appendChild(table);
        table.style.width = "100%";
        table.className = "ygui-table";
    
        for (var field of fields) {
            var tr = document.createElement("tr");
            table.appendChild(tr);
    
            var fieldLabelTD = document.createElement("td");
            fieldLabelTD.innerHTML = `<label for="${field.id}" class="ygui-label">${field.label}</label>`;
            tr.appendChild(fieldLabelTD);
    
            var fieldInputTD = document.createElement("td");
            fieldInputTD.style.width = "1px"; // force right align
            switch (field.type) {
                case "select":
                    var inputElem = document.createElement("select");
                    for (var option of field.options) {
                        var optionElem = document.createElement("option");
                        optionElem.innerHTML = option;
                        inputElem.appendChild(optionElem);
                    }
                    break;
                default:
                    var inputElem = document.createElement("input");
                    inputElem.type = field.type;
                    break;
            }
            inputElem.id = field.id;
            inputElem.className = "ygui-input";
            fieldInputTD.appendChild(inputElem);
            tr.appendChild(fieldInputTD);
    
            for (var attribute in field.attr) {
                inputElem.setAttribute(attribute, field.attr[attribute]);
            }
    
            inputs_out[field.id] = inputElem;
        }
    
        return inputs_out;
    }
};

export default ygui;