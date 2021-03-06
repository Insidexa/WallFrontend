WallController.$inject = ['$timeout', 'orderByFilter', '$interval', 'WallService', 'AuthService'];
function WallController($timeout, orderByFilter, $interval, WallService, AuthService) {
    var vm = this;

    vm.wall = {images: []};
    vm.editWall = {images: []};
    vm.walls = [];
    vm.server = SERVER_URL;
    vm.reverse = true;
    vm.user = AuthService.getUser();
    vm.propertyName = 'created_at';

    vm.init = init;
    vm.addImage = addImage;
    vm.removeImage = removeImage;
    vm.add = add;
    vm.update = update;
    vm.addComment = addComment;
    vm.reply = reply;
    vm.remove = remove;
    vm.editWallForm = editWallForm;
    vm.like = like;
    vm.noInteresting = noInteresting;
    vm.sortBy = sortBy;
    vm.editCommentForm = editCommentForm;
    vm.removeComment = removeComment;
    vm.updateComment = updateComment;
    
    vm.getStyle =  getStyle;
    
    function getStyle(level) {
        return 'margin-left: ' + level + '0px !important';
    }

    $interval(function () {
        angular.forEach(vm.walls, function (wall) {
            if (wall.showTimeFromEdit) {
                if(wall.user.id === vm.user.id)
                    wall.time = moment(wall.updated_at).from(moment(new Date()));
            }
            angular.forEach(wall.comments, function (comment) {
                if (comment.showTimeFromEdit) {
                    if(comment.user.id === vm.user.id)
                        comment.time = moment(comment.updated_at).from(moment(new Date()));
                }
            });
        });
    }, 5000);

    function removeComment(wallIndex, commentIndex) {
        WallService.removeComment(vm.walls[wallIndex].comments[commentIndex].id, vm.walls[wallIndex].id);
    }

    function editCommentForm(wallIndex, commentIndex) {
        vm.comment = vm.walls[wallIndex].comments[commentIndex];
    }

    function updateComment(comment) {
        WallService.updateComment(comment);
        vm.comment = null;
    }

    function sortBy(propertyName) {
        vm.reverse = (propertyName !== null && vm.propertyName === propertyName) ? !vm.reverse : false;
        vm.propertyName = propertyName;
        vm.walls = orderByFilter(vm.walls, vm.propertyName, vm.reverse);
    }

    function noInteresting(index) {
        WallService.noInteresting(vm.walls[index].id);
    }

    function like(typeId, type, wallId) {
        WallService.like({
            type_id: typeId,
            type: type,
            user_id: 1,
            wall_id: wallId
        });
    }

    function init() {
        WallService.getWalls().then(function (response) {
            vm.walls = response.walls || [];
        });

        var routes = {
            'client_walls': function (response) {
                vm.walls = response;
            },
            'client_remove_wall': function (response) {
                angular.forEach(vm.walls, function (wall, index) {
                    if (wall.id == response) {
                        vm.walls.splice(index, 1);
                    }
                })
            },
            'client_update_wall': function (response) {
                angular.forEach(vm.walls, function (wall, index) {
                    if (wall.id === response.id) {
                        if(wall.user.id === vm.user.id) {
                            response.showTimeFromEdit = true;
                            response.time = moment(wall.updated_at).from(moment(new Date()));
                        }
                        vm.walls[index] = response;
                    }
                });
            },
            'client_add_wall': function (response) {
                vm.walls.push(response);
            },
            'client_no_interesting': function (response) {
                angular.forEach(vm.walls, function (wall, index) {
                    if (wall.id == response) {
                        vm.walls.splice(index, 1);
                    }
                })
            },
            'client_like': function (response) {
                angular.forEach(vm.walls, function (wall) {
                    if (response.type == 'wall' && response.type_id == wall.id) {
                        wall.is_liked = response.action;
                        wall.likes = response.count;
                    } else if (response.type == 'comment' && response.wall_id == wall.id) {
                        angular.forEach(wall.comments, function (comment) {
                            if (comment.id == response.type_id) {
                                comment.is_liked = response.action;
                                comment.likes = response.count;
                            }
                        });
                    }
                });
            },
            'client_add_comment': function (response) {
                angular.forEach(vm.walls, function (wall, index) {
                    if (response.wall_id == wall.id) {
                        if (response.parent_id) {
                            vm.walls[index].comments.forEach(function (comment, commentIndex) {
                                if (comment.id === response.parent_id) {
                                    vm.walls[index].comments.insert(commentIndex + 1, response);
                                }
                            });
                        } else {
                            vm.walls[index].comments.push(response);
                        }
                    }
                })
            },
            'client_remove_comment': function (response) {
                angular.forEach(vm.walls, function (wall, wallIndex) {
                    if (response.wall_id == wall.id) {
                        for(var i = wall.comments.length - 1; i >= 0; i--) {
                            var comment = wall.comments[i];
                            if(response.comment_ids.includes(comment.id)) {
                                vm.walls[wallIndex].comments.splice(i, 1);
                            }
                        }
                    }
                });
            },
            'client_update_comment': function (response) {
                angular.forEach(vm.walls, function (wall, wallIndex) {
                    if (response.wall_id == wall.id) {
                        angular.forEach(wall.comments, function (comment, commentIndex) {
                            if (comment.id == response.id) {
                                if (comment.user.id === vm.user.id) {
                                    response.showTimeFromEdit = true;
                                    response.time = moment(comment.updated_at).from(moment(new Date()));
                                }
                                vm.walls[wallIndex].comments[commentIndex] = response;
                            }
                        });
                    }
                });
            }
        };

        var conn = new ab.Session('ws://185.14.187.188:8080',
            function () {
                conn.subscribe('wall', function (topic, data) {
                    var object = {};
                    for (var key in data) {
                        if (data.hasOwnProperty(key)) {
                            object[key] = data[key];
                        }
                    }
                    if (routes.hasOwnProperty(object.action)) {
                        $timeout(function () {
                            routes[object.action](object.response);
                        }, 0);
                    } else throw new Error('Undeclared route: ', data.action);
                });
            },
            function () {
                console.warn('WebSocket connection closed');
            },
            {'skipSubprotocolCheck': true}
        );
    }

    function editWallForm(index) {
        vm.editWall = vm.walls[index];
    }

    function remove(index) {
        WallService.removeWall(vm.walls[index].id);
    }

    function reply(commentId) {
        vm.comment = {};
        vm.comment.parent_id = commentId;
    }

    function addComment(id, text) {
        WallService.addComment({
            comment: {
                text: text,
                parent_id: (vm.comment) ? vm.comment.parent_id : null
            },
            wall_id: id
        });
        vm.comment = null;
    }

    function update() {
        WallService.updateWall({
            id: vm.editWall.id,
            text: vm.editWall.text,
            removeImages: vm.editWall.removeImages,
            images: vm.editWall.images
        });
        vm.editWall = {images: []};
    }

    function add() {
        WallService.addWall(vm.wall);
        vm.wall = {images: []};
    }

    function removeImage(index, type) {
        if (type === 'editWall') {
            if (!vm[type].removeImages) vm[type].removeImages = [];
            if (vm[type].images[index].path)
                vm[type].removeImages.push(vm[type].images[index].id);
        }

        vm[type].images.splice(index, 1);
    }

    function addImage(file, type) {
        vm[type].images.push({
            image: file
        });
    }
}