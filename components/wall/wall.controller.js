
WallController.$inject = ['$scope', 'WSFactory', '$timeout', 'orderByFilter', '$interval'];
function WallController($scope, WSFactory, $timeout, orderByFilter, $interval) {
    var vm = this;

    vm.wall = {
        images: []
    };
    vm.walls = [];
    vm.server = SERVER_URL;
    vm.flowObject = {
        files: []
    };
    vm.reverse = true;
    vm.propertyName = 'created_at';

    vm.init = init;
    vm.addImage = addImage;
    vm.removeImage = removeImage;
    vm.add = add;
    vm.addComment = addComment;
    vm.reply = reply;
    vm.remove = remove;
    vm.edit = edit;
    vm.like = like;
    vm.noInteresting = noInteresting;
    vm.sortBy = sortBy;
    vm.editCommentForm = editCommentForm;
    vm.removeComment = removeComment;
    vm.updateComment = updateComment;

    $interval(function () {
        angular.forEach(vm.walls, function (wall) {
            if (wall.showTimeFromEdit) {
                wall.time = moment.preciseDiff(wall.updated_at, new Date());
            }
            angular.forEach(wall.comments, function (comment) {
                if (comment.showTimeFromEdit) {
                    comment.time = moment.preciseDiff(comment.updated_at, new Date());
                }
            });
        });
    }, 5000);

    function removeComment(wallIndex, commentIndex) {
        WSFactory.send({
            action: 'user_remove_comment',
            wall_id: vm.walls[wallIndex].id,
            comment_id: vm.walls[wallIndex].comments[commentIndex].id
        });
    }

    function editCommentForm(wallIndex, commentIndex) {
        vm.comment = vm.walls[wallIndex].comments[commentIndex];
    }

    function updateComment(comment) {
        WSFactory.send({
            action: 'user_update_comment',
            comment: comment
        });
    }

    function sortBy(propertyName) {
        vm.reverse = (propertyName !== null && vm.propertyName === propertyName)
            ? !vm.reverse : false;
        vm.propertyName = propertyName;
        vm.walls = orderByFilter(vm.walls, vm.propertyName, vm.reverse);
    }

    function noInteresting(index) {
        WSFactory.send({
            action: 'user_no_interesting',
            id: vm.walls[index].id
        });
    }

    function like(typeId, type, wallId) {
        WSFactory.send({
            action: 'user_wall_like',
            type_id: typeId,
            type: type,
            user_id: 1,
            wall_id: wallId
        });
    }

    function init() {
        WSFactory.init(function () {
            WSFactory.send({
                action: 'get_walls'
            });
        }, initRouter);
    }

    function initRouter (event) {
        var routes = {
            'client_walls': function (response) {
                vm.walls = response;
            },
            'client_remove_wall': function (response) {
                vm.walls.splice(response, 1);
            },
            'client_like_wall': function (response) {
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
            'client_add_wall': function (response) {
                vm.walls.push(response);
            },
            'client_add_comment': function (response) {
                angular.forEach(vm.walls, function (wall) {
                    if (response.wall_id == wall.id) {
                        wall.comments.push(response);
                    }
                })
            },
            'client_no_interesting': function (response) {
                angular.forEach(vm.walls, function (wall, index) {
                    if (wall.id == response) {
                        vm.walls.splice(index, 1);
                    }
                })
            },
            'client_remove_comment': function (response) {
                angular.forEach(vm.walls, function (wall, wallIndex) {
                    if (response.wall_id == wall.id) {
                        angular.forEach(wall.comments, function (comment, commentIndex) {
                            if (comment.id == response.comment_id) {
                                vm.walls[wallIndex].comments.splice(commentIndex, 1);
                            }
                        });
                    }
                });
            },
            'client_update_comment': function (response) {
                angular.forEach(vm.walls, function (wall, wallIndex) {
                    if (response.wall_id == wall.id) {
                        angular.forEach(wall.comments, function (comment, commentIndex) {
                            if (comment.id == response.id) {
                                response.showTimeFromEdit = true;
                                response.time = moment.preciseDiff(comment.updated_at, new Date());
                                vm.walls[wallIndex].comments[commentIndex] = response;
                            }
                        });
                    }
                });
            }
        };

        var data = JSON.parse(event.data);

        if (routes.hasOwnProperty(data.action)) {
            $timeout(function () {
                routes[data.action](data.response);
            }, 0);
        } else throw new Error('Undeclared route: ', data.action);
    }

    function edit(index) {
        vm.wall = vm.walls[index];
    }
    
    function remove(index) {
        WSFactory.send({
            action: 'user_remove_wall',
            index: index,
            id: vm.walls[index].id
        });
    }

    function reply(commentId) {
        vm.comment.parent_id = commentId;
    }
    
    function addComment(id, text) {
        WSFactory.send({
            action: 'user_add_comment',
            comment: {
                text: text,
                parent_id: 0
            },
            wall_id: id
        });
    }

    function add() {
        WSFactory.send({
            action: 'user_add_wall',
            wall: vm.wall
        });
        vm.wall = {images: []};
    }

    function removeImage(index) {
        vm.wall.images.splice(index, 1);
    }

    function addImage(file) {
        if (vm.wall.images.length > MAX_COUNT_IMAGES) {
            alert('No more 5 files');
            vm.wall.images.splice(MAX_COUNT_IMAGES, vm.wall.images.length - MAX_COUNT_IMAGES);
        } else {
            vm.wall.images.push({
                image: file
            });
        }
    }
}