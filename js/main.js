function parseJSON(response) {
if (response.status === 204 || response.status === 205) {
    return null;
}
if (response.status === 404) {
    return null;
}
return response.json();
}

function parseBlob(response) {
return response.blob();
}


function removeAllLocalKeys() {
localStorage.clear();
}

function checkStatus(response) {
hideLoader();
if (response.status >= 200 && response.status < 300) {
    return response;
}
if (response.status === 401) {
    removeAllLocalKeys();
    window.location.reload();
} if (response.status === 404) {
    return response;
} else if (response.status === 500) {
    return response;
}
}

function request(url, options, isBlob) {
showLoader();
if (isBlob) {
    return fetch(url, options)
        .then(checkStatus)
        .then(parseBlob);
}
return fetch(url, options)
    .then(checkStatus)
    .then(parseJSON);
}

function showLoader(){
    $('#loader').show();
    try {
        NProgress.configure({ showSpinner: false });
        NProgress.start();
    } catch (e) {
        if (e instanceof ReferenceError) {
            printError(e, true);
        } else {
            printError(e, false);
        }
    }
}

function hideLoader(){
    $('#loader').fadeOut();
    try {
        NProgress.set(1);
        NProgress.done();
    } catch (e) {
        if (e instanceof ReferenceError) {
            printError(e, true);
        } else {
            printError(e, false);
        }
    }
}

function addEvent(element, evnt, funct){
    // element.removeEventListener(evnt, funct);
    if (element.attachEvent)
        return element.attachEvent('on'+evnt, funct);
    else
        return element.addEventListener(evnt, funct, false);
}

function on(elSelector, eventName, selector, fn) {
    var element = document.querySelector(elSelector);
    // removeDelegatedEvent;
    addEvent(
        element,
        eventName,
        function(event) {
            var possibleTargets = element.querySelectorAll(selector);
            var target = event.target;
            for (var i = 0, l = possibleTargets.length; i < l; i++) {
                var el = target;
                var p = possibleTargets[i];

                while(el && el !== element) {
                    if (el === p) {
                        return fn.call(p, event);
                    }
                    el = el.parentNode;
                }
            }
        }
    );
}
/*
 *
 * Handlebars
 *
 */
Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper('ifNotEquals', function(arg1, arg2, options) {
    return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});

function loadTemplate(el,templateId,data,partialIds){
    if (el){
        if (!data) data = {};
        var template = Handlebars.compile(document.getElementById(templateId).innerHTML);
        if (Array.isArray(partialIds) && partialIds.length > 0){
            partialIds.forEach(function(partialId) {
                Handlebars.registerPartial(partialId, document.getElementById(partialId).innerHTML);
            });
        }
        el.innerHTML = template(data);
    }
}


/*
 *
 * Templates
 *
 */
function loadShoppingCartTemplate(){
	// var json = {
	// 	count:3,
	// 	items:[
	// 		{
 //                id:0,
 //                'name':'Incredibles Tshirt','imgUrl':'img/item1.jpg','style':'M14S',color:'White','size':'S','qty':'1','price':'249'

 //            },
	// 		{
 //                id:1,'name':'NOVA Polyester Tshirt','imgUrl':'img/item2.jpg','style':'M13S',color:'Black','size':'S','qty':'1','price':'299'},
	// 		{
 //                id:2,'name':'Cargo Defence Pants','imgUrl':'img/item3.jpg','style':'M12S',color:'Blue','size':'S','qty':'1','price':'349'},
	// 	],
 //        'checkout':{
 //            'subtotal':1000,
 //            'shippingValue':'free',
 //            'price':1000,
 //        }

	// };

    let itemsUrl = `http://localhost:3000/items`;
    let checkoutUrl = `http://localhost:3000/checkout`;
    fetch(itemsUrl)
    .then(resp => resp.json())
    .then(items => {
        fetch(checkoutUrl)
        .then(resp => resp.json())
        .then(checkout => {
            let json = Object.assign({},{
                "items":items,
                "checkout":checkout});
            loadTemplate(document.getElementById('root'),'shopping-cart-template',json);
    addOrderPenaltyEvent(json);
        })
    })
}

function addOrderPenaltyEvent(json){
    var items = json.items;
    var clicked_item;

    $('.cart .row .edit').on('click',function(e){
        var id = $(e.target).closest('.row').data('id');
        clicked_item = items.find(function(item){
            return item.id === id;
        })
        showEditModal(clicked_item);
    });
    $('.cart .row .remove').on('click',function(){

    });
    $('.cart .row .save-for-later').on('click',function(){

    });
}

function showEditModal(clicked_item){
    loadTemplate(document.getElementById('cartModal'),'editModal-template',clicked_item);
    $('#editModal+label').click();
}

/*
 *
 * Main
 *
 */
addEvent(window, 'load', function (){
    loadShoppingCartTemplate();
});

let deleteCart = (id) => {
    const deleteURL = `http://localhost:3000/items/`+id;
    const deleteData = {
        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, same-origin, *omit
        headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer' // no-referrer, *client
        }
        fetch(deleteURL,deleteData)
        .then(() => {
            window.location.reload();
        });
}

let editCart = (id) => {
    let s = document.getElementsByTagName(`select`)[0];
    let q = document.getElementsByTagName(`select`)[1]

    let size = s.options[s.selectedIndex].value;
    let qty = q.options[q.selectedIndex].value;
    let url = `http://localhost:3000/items/`+id;
    fetch(url)
    .then(resp => resp.json())
    .then(data => {
        let editedObject = Object.assign({},data,{
            "size":size,
            "qty":qty,
            "price":data.rate*qty
        });
        const putData = {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            headers: {
            'Content-Type': 'application/json; charset=utf-8',
            // "Content-Type": "application/x-www-form-urlencoded",
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify(editedObject)
        }; 
        fetch(url,putData)
        .then(() => {
            computeTotal();
        });
   })
}

let computeTotal = () => {
    let url = `http://localhost:3000/items`;
    fetch(url)
    .then(resp => resp.json())
    .then(items => {
        let total = 0;
        items.map(item => {
            total += parseInt(item.price);
        });

        let putUrl = `http://localhost:3000/checkout`;
        fetch(putUrl)
    .then(resp => resp.json())
    .then(data => {
        let price = total-parseInt(data.promoCodeValue);
        console.log(price);
        let editedObject = Object.assign({},data,{
            "subtotal":total,
            "price":price
        });
        console.log(editedObject);
        const putData = {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            headers: {
            'Content-Type': 'application/json; charset=utf-8',
            // "Content-Type": "application/x-www-form-urlencoded",
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify(editedObject)
        }; 
        fetch(putUrl,putData)
        .then(() => {
            window.location.reload();
        });
    })
});
}

let applyPromo = () => {
    let promoCode = document.getElementById(`promocode`).value;
    console.log(promoCode);
    let url = `http://localhost:3000/promotions`;
    fetch(url)
    .then(resp => resp.json())
    .then(promotions => {
        console.log(promotions);
        promotions.map(promo => {
            console.log(promo.coupon);
            if(promo.coupon==promoCode){
                console.log(promo.price);
                updatePromo(promo);
            }
        })
    })
}

let updatePromo = (promotion) => {
    let url = `http://localhost:3000/checkout`;
    fetch(url)
    .then(resp => resp.json())
    .then(data => {
        let price = data.total-parseInt(data.price);
        let object = Object.assign({},data, {
            "promocode":promotion.coupon,
            "promoCodeValue":promotion.price,
            "price":price
        });
        console.log(object);
        const putData = {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            headers: {
            'Content-Type': 'application/json; charset=utf-8',
            // "Content-Type": "application/x-www-form-urlencoded",
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify(object)
        }; 
        fetch(url,putData)
        .then(()=>{
            window.location.reload();
        });
    })
}