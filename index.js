/*
 * index.js
 */


/*
 * parse and validate timecode
 */
function parse(string) {
  var match = string.match(/^([0-9][0-9]):([0-9][0-9]):([0-9][0-9])([:,;])([0-9]{2,})$/);
  if(match) {
    var hh = match[1]
        mm = match[2],
        ss = match[3],
        drop = match[4],
        ff= match[5];

    if(parseInt(hh, 10)>23) return null;
    if(parseInt(mm, 10)>59) return null;
    if(parseInt(ss, 10)>59) return null;

    return {
      hh: hh,
      mm: mm,
      ss: ss,
      drop: drop,
      ff: ff
    };
  } else {
    return null;
  }
}


/*
 * timecode to string
 */
function tc2string(tc) {
  return `${tc.hh}:${tc.mm}:${tc.ss}${tc.drop}${tc.ff}`;
}


/*
 * NomaTimecode
 */
class NomaTimecode extends HTMLElement {


  constructor() {
    super();
  }


  connectedCallback() {
    this.init();
    this.render();
    this.__onClick = this.onClick(this);
    this._bind();
  }


  init() {
    this.editing = false;
    this.tc = parse(this.getAttribute('timecode'));
  }


  startEditMode() {
    this.renderEditMode();
    this.input = this.querySelector('input');
    this.input.value = tc2string(this.tc);
    this._bindEditMode();
  }


  _bindEditMode() {
    this.removeEventListener('click', this.__onClick);
    this.btn = this.querySelector('button');
    this.btn.addEventListener('click', this.onSaveClick(this));
    this.input.focus();
    this.input.addEventListener('keydown', this.onKeyDown(this));
    this.input.addEventListener('blur', this.onBlur(this));
  }


  onKeyDown(self) {
    return function (evt) {
      if(evt.key == 'Enter') {
        self.onSaveClick(self)(evt);
      } else if (evt.key == 'Escape') {
        self.editing = false;
        self.render();
        self._bind();
      }
    }
  }


  onBlur(self) {
    return self.onSaveClick(self);
  }


  onSaveClick(self) {
    return function (evt) {
      evt.preventDefault();
      evt.stopPropagation();
      var tc = parse(self.input.value.trim());
      if(tc) {
        self.editing = false;
        self.tc = tc;
        self.render();
        self._bind();

        self.sendEvent();

      } else {
        self.animate(
          [ { transform: 'rotate(2deg)' }
          , { transform: 'rotate(-2deg)' }
          , { transform: 'rotate(2deg)' }
          , { transform: 'rotate(-2deg)' }
          , { transform: 'rotate(2deg)' }
          , { transform: 'rotate(0)' }
          ],
          500
        );
      }
    }
  }


  sendEvent() {
    var evt = new CustomEvent('timecode', { detail: tc2string(this.tc) });
    this.dispatchEvent(evt);
  }


  renderEditMode() {
    // svg icon from https://shape.so/
    this.innerHTML =
`<input>
<button>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-reactroot="">
<path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" d="M2 22H10"></path>
<path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" d="M22 22H14"></path>
<path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" fill="none" d="M10 7H4V3C4 2.45 4.45 2 5 2H9C9.55 2 10 2.45 10 3V7Z" clip-rule="evenodd" fill-rule="evenodd"></path>
<path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" fill="none" d="M14 7H20V3C20 2.45 19.55 2 19 2H15C14.45 2 14 2.45 14 3V7Z" clip-rule="evenodd" fill-rule="evenodd"></path>
<path stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" d="M14 10H10V11H14V10Z"></path>
<path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" fill="none" d="M9.5 19H2.5C2.22 19 2 18.78 2 18.5V8C2 7.45 2.45 7 3 7H10V18.5C10 18.78 9.78 19 9.5 19Z" clip-rule="evenodd" fill-rule="evenodd"></path>
<path stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1" fill="none" d="M14.5 19H21.5C21.78 19 22 18.78 22 18.5V8C22 7.45 21.55 7 21 7H14V18.5C14 18.78 14.22 19 14.5 19Z" clip-rule="evenodd" fill-rule="evenodd"></path>
</svg>
</button>
`;
  }


  onClick(self) {
    return function (evt) {
        if(!self.editing) {
        self.editing = true;
        self.startEditMode();
      }
    };
  }


  _bind() {    
    this.addEventListener('click', this.__onClick);
  }


  render() {
    this.innerHTML =
`<div class="hh">
<span>${this.tc.hh}</span>
</div>
<div class="mm">
<span>${this.tc.mm}</span>
</div>
<div class="ss">
<span>${this.tc.ss}</span>
</div>
<div class="ff">
<span>${this.tc.ff}</span>
</div>
`;
  }


}


/*
 * expose element
 */
customElements.define('noma-timecode', NomaTimecode);
