var timeOut;

class Item {
    constructor(icon, backgroundColor, idValue) {
        this.$element = $(document.createElement("div"));
        this.icon = icon;
        this.$element.attr("id", idValue);
        this.$element.addClass("item");
        this.$element.css("background-color", backgroundColor);
        this.$element.css("left", "-560px");
        this.$element.css("top", "-190px");
        var i = document.createElement("img");
        $(i).addClass("fi-" + icon);
        this.$element.append(i);
        this.prev = null;
        this.next = null;
        this.isMoving = false;
        var element = this;
        this.$element.on("mousemove", function() {
            clearTimeout(timeOut);
            timeOut = setTimeout(function() {
                if (element.next && element.isMoving) {
                    element.next.moveTo(element);
                }
            }, 10);
        });
    }

    moveTo(item) {
        anime({
            targets: this.$element[0],
            left: item.$element.css("left"),
            top: item.$element.css("top"),
            duration: 700,
            elasticity: 500
        });
        if (this.next) {
            this.next.moveTo(item);
        }
    }

    updatePosition() {
        anime({
            targets: this.$element[0],
            left: this.prev.$element.css("left"),
            top: this.prev.$element.css("top"),
            duration: 200
        });

        if (this.next) {
            this.next.updatePosition();
        }
    }
}

class Menu {
    constructor(menu) {
        this.$element = $(menu);
        this.size = 0;
        this.first = null;
        this.last = null;
        this.timeOut = null;
        this.hasMoved = false;
        this.status = "closed";
    }

    add(item, idValue) {
        var menu = this;
        if (this.first == null) {
            this.first = item;
            this.last = item;
            this.first.$element.on("mouseup", function() {
                if (menu.first.isMoving) {
                    menu.first.isMoving = false;
                } else {
                    menu.click();
                }
            });
            item.$element.draggable({
                start: function() {
                    menu.close();
                    item.isMoving = true;
                }
            }, {
                drag: function() {
                    if (item.next) {
                        item.next.updatePosition();
                    }
                }
            }, {
                stop: function() {
                    item.isMoving = false;
                    item.next.moveTo(item);
                }
            });
        } else {
            this.last.next = item;
            item.prev = this.last;
            this.last = item;
        }
        this.$element.after(item.$element);

    }

    open(time) {
        if (time == null) {
            time = 1000;
        }
        this.status = "open";
        var current = this.first.next;
        var iterator = 1;
        var head = this.first;
        var sens = head.$element.css("bottom") < head.$element.css("top") ? 1 : -1;
        while (current != null) {
            anime({
                targets: current.$element[0],
                left: parseInt(head.$element.css("left"), 10), // + (sens * (iterator * 85)),
                top: parseInt(head.$element.css("top"), 10) - (sens * (iterator * 85)),
                duration: time
            });
            iterator++;
            current = current.next;
        }
    }

    close(time) {
        if (time == null) {
            time = 500;
        }
        this.status = "closed";
        var current = this.first.next;
        var head = this.first;
        var iterator = 1;
        while (current != null) {
            anime({
                targets: current.$element[0],
                left: head.$element.css("left"),
                top: head.$element.css("top"),
                duration: time
            });
            iterator++;
            current = current.next;
        }
    }

    click() {
        if (this.status == "closed") {
            this.open();
        } else {
            this.close();
        }
    }

}