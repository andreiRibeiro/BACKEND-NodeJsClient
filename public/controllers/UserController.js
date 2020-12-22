class UserController {
    constructor(formCreate, formUpdate, tableId){
        this.formCreate = document.getElementById(formCreate);
        this.formUpdate = document.getElementById(formUpdate);

        this.boxCreate = document.getElementById('box-user-create');
        this.boxUpdate = document.getElementById('box-user-update');        

        this.tableUsers = document.getElementById(tableId);

        this.onSubmitCreated();
        this.onSubmitUpdate();
        this.onCancel();        
        this.loadStorage();
    }

    onCancel(){
        document.getElementById('btnCancelarUpdate').addEventListener('click', (e) => {
            this.boxCreate.style.display = 'block';
            this.boxUpdate.style.display = 'none';
        })
    }

    onSubmitCreated(){
        this.formCreate.addEventListener('submit', e =>  {
            e.preventDefault();
            
            this.enableSubmit(true);

            var user = this.getUser(this.formCreate);
           
            if (!user) return false;

            this.getPhoto().then(
                (content) => {
                    user.photo = content;
                    
                    user.saveStorage('creat').then((user) => {
                        this.createTr(user);
                        this.enableSubmit(false);
                        this.updateCountUsers();
                        this.formCreate.reset();
                    });
                }, 
                (e) => {
                    console.error(e);
                }
            );
        });        
    }

    onSubmitUpdate(){
        this.formUpdate.addEventListener('submit', e =>  {
            e.preventDefault();
            
            this.enableSubmit(true);

            let user = this.getUser(this.formUpdate);

            let trIndex = this.formUpdate.dataset.trIndex;
            
            let tr = this.tableUsers.rows[trIndex];

            //Corrigir photo
            user.photo = 'dist/img/user.jpg';
            user._id = JSON.parse(tr.dataset.user)._id;

            user.saveStorage('update').then((user) => {
                tr.innerHTML = this.createTd(user);
                this.editTr(tr)
                this.deleteTr(tr);
                this.updateCountUsers();
                this.boxCreate.style.display = 'block';
                this.boxUpdate.style.display = 'none'; 
            });                
        });
    }

    loadStorage(){
        //let users = User.getUsersStorage();

        HttpRequest.get('http://localhost:3000/users').then((json) => {
            json.users.forEach((data) => {
                let user = new User();
                user.parseFromJson(data);
                this.createTr(user);
            }); 
            this.updateCountUsers();
        });
    }   

    createTr(user){
        let tr = document.createElement('tr');
        tr.dataset.user = JSON.stringify(user);
        tr.innerHTML = this.createTd(user);
        this.tableUsers.appendChild(tr);    
        this.editTr(tr); 
        this.deleteTr(tr);
    }

    deleteTr(tr){
        tr.querySelector('.btn-delete').addEventListener('click', e => {  
            if (confirm('Deseja realmente excluir este registro?')){

                let json = JSON.parse(tr.dataset.user);
                let user = new User(json.name, json.gender, json.birth, json.country, json.email, json.password, json.photo, json.admin);
                user._id = json._id;
                user.removeStorage().then((data) => {
                    tr.remove();
                    this.updateCountUsers();
                });
            }
        });
    }

    editTr(tr){
        tr.querySelector('.btn-edit').addEventListener('click', e => {                        
            let json = JSON.parse(tr.dataset.user);

            this.formUpdate.dataset.trIndex = tr.sectionRowIndex;

            for (let atribute in json){
                let field = this.formUpdate.querySelector(`[name=${atribute}]`);
                
                if (field){

                    if (atribute != 'register' && field.type != 'file'){ 
                        field.value = json[atribute];
                    }

                    if (field.type == 'radio'){                    
                        let fieldRadio = this.formUpdate.querySelector(`[name=${atribute}][value=${json[atribute]}]`);

                        if (fieldRadio.value = 'F' && json[atribute] == 'F'){
                            let womam = this.formUpdate.querySelector('#exampleInputGenderUpdateF');
                            womam.checked = true;
                        } else {
                            let man = this.formUpdate.querySelector('#exampleInputGenderUpdateM');
                            man.checked = true;
                        }
                    }

                    if (field.type == 'checkbox'){
                        field.checked = json[atribute];
                    }
                }    
            }       

            this.boxCreate.style.display = 'none';
            this.boxUpdate.style.display = 'block';
        });
    }

    updateCountUsers(){
        let numberUsers = 0;
        let numberUsersAdmin = 0;

        [...this.tableUsers.children].forEach((tr) => {
            
            let user = JSON.parse(tr.dataset.user);

            if (user.admin) numberUsersAdmin++;
            numberUsers++;
        });

        document.getElementById('number-users').innerHTML = numberUsers;
        document.getElementById('number-users-admin').innerHTML = numberUsersAdmin;
    }

    enableSubmit(boolean){
        this.formCreate.querySelector('[type=submit]').diseable = boolean;
    }

    getPhoto(){        
        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...this.formCreate.elements].filter(item => {
                if (item.name === 'photo') return item;
            });
        
            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = (e) => {
                reject(e);
            }
    
            let file = elements[0].files[0];

            if (file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve("dist/img/user.jpg");
            }
        });        
    }

    getUser(form){
        let user = [];
        let formIsValid = true;

        [...form.elements].forEach((field) => {            

            formIsValid = this.validateForm(field);

            switch (field.name){
                case 'admin':
                    user[field.name] = field.checked;
                break;
                
                case 'gender':                    
                    if (field.checked){
                        user[field.name] = field.id.substring(field.id.length -1);
                    }
                break;

                default:
                    user[field.name] = field.value;
            }                   
        });        

        if (!formIsValid) return false;

        return new User(user.name, user.gender, user.birth, user.country, user.email, user.password, user.photo, user.admin);         
    }

    validateForm(field){
        if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value){
            field.parentElement.classList.add('has-error');
            return false;
        }
        return true;
    }

    createTd(user){           
        return `    
            <td><img src="${user.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${(user.admin) ? "SIM" : "NÃO"}</td>
            <td>${Utils.dateFormat(user.register)}</td>
            <td>
                <button type="button" class="btn btn-edit btn-primary btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-delete btn-danger btn-xs btn-flat">Excluir</button>
            </td>    
        `
    }    
}