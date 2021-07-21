class PriorityQueue {
    constructor() {
        this.contents = [];
        this.sorted = false;
    }
    sort() {

        this.contents.sort();
        this.sorted = true;
  
    }
    pop() {

        if ( !this.sorted ) {
  
            this.sort();
  
        }
  
        return this.contents.pop();
  
    }
  
    top() {
  
        if ( !this.sorted ) {
  
            this.sort();
  
        }
  
        return this.contents[ this.contents.length - 1 ];
  
    }
  
    push( object, priority ) {

        this.contents.push( { object: object, priority: priority } );
        this.sorted = false;

    }

}
export default PriorityQueue