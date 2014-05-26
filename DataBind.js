/*
MVVM
<div data-bind-view="price"></div>
<input type="text" data-bind-model="price" />

Two-Way-Data-Bind
<div data-bind-view="price"></div>
DataBind.set("price","1000");

Operate
<input type="text" data-bind-model="price" />
<input type="text" data-bind-model="num" />
<div data-bind-view="price * num"></div>
*/
var DataBind = (function(){
    var store = {},
        viewAttr = 'data-bind-view',
        dataView = document.querySelectorAll('['+viewAttr+']'),
        modelAttr = 'data-bind-model',
        dataModel = document.querySelectorAll('['+modelAttr+']'),
        strReg = /([a-zA-Z\.]+)+/g,
        typeChg = function(val){
            var intReg = /^([0-9]+)$/;
            if(intReg.test(val)){
                val *= 1;
            }
            return val;
        },
        set = function(topic, val){
            var storeTopic = store[topic];
            if(storeTopic.val){
                storeTopic.val = val;
            }else{
                storeTopic.val = '';
                Object.defineProperty(storeTopic,'val',{
                    get: function(){
                        return this.newVal;
                    },
                    set: function(newVal){

                        var newVal = newVal || '';
                        this.newVal = newVal;
                        var topicElems = this.objs;

                        if(topicElems !== undefined){
                            for(var i = 0, len = topicElems.length; i < len; i++){
                                var elem = topicElems[i];
                                var elemTag = elem.tagName.toLowerCase();

                                /*
                                연산 기호가 있을 때 len이 두개 이상으로 되므로
                                store[].val형식으로 바꿔준다.
                                */
                                var attrVal = elem.getAttribute(viewAttr);
                                var regMatch = attrVal.match(strReg);
                                var len = regMatch.length;
                                if(len > 1){
                                    for(var i = 0; i < len; i++){
                                        attrVal = attrVal.replace(regMatch[i], "typeChg(store['"+regMatch[i]+"'].val)");
                                    }
                                    newVal = eval(attrVal);
                                }

                                if(elemTag == "input" || elemTag == "textarea"){
                                    elem.value = newVal;
                                }else{
                                    elem.innerHTML = newVal;
                                }
                            }   
                        }
                    }
                });

                storeTopic.val = val;
            }
        };


    for(var i = 0, viewLen = dataView.length; i < viewLen; i++){
        var elem = dataView[i];
        var attrVal = elem.getAttribute(viewAttr);

        var regMatch = attrVal.match(strReg);
        var len = regMatch.length;
        for(var i = 0; i < len; i++){
            attrVal = regMatch[i];

            store[attrVal] = store[attrVal] || {};
            store[attrVal].objs = store[attrVal].objs || [];
            store[attrVal].val = store[attrVal].val || '';
            store[attrVal].objs.push(elem);
        }
    }

    for(var j = 0, modelLen = dataModel.length; j < modelLen; j++){
        var elem = dataModel[j];
        var attrVal = elem.getAttribute(modelAttr);

        store[attrVal] = store[attrVal] || {};
        store[attrVal].val = store[attrVal].val || '';

        elem.onkeyup = elem.onchange = function(){
            var thisAttrVal = this.getAttribute(modelAttr);
            store[thisAttrVal].val = this.value;
        };
        set(attrVal,elem.value);
    }

    return {
        set: set
    }
}());
