
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/testing/all-data": {
        "delete": {
          "operationId": "TestController_deleteAllData",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/blogs": {
        "get": {
          "operationId": "BlogsController_getBlogsWithPagination",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "BlogsController_postBlog",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateBlogInputModelType"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/blogs/{id}": {
        "get": {
          "operationId": "BlogsController_getBlogById",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "put": {
          "operationId": "BlogsController_updateBlog",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateBlogInputModelType"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "BlogsController_deleteBlogByID",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/blogs/{id}/posts": {
        "get": {
          "operationId": "BlogsController_getPostsByBlogId",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "BlogsController_createPostByBlogId",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePostByBlogIdInputModelType"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/posts": {
        "get": {
          "operationId": "PostsController_getPostsWithPagination",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "PostsController_postPost",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePostInputModelType"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/posts/{id}": {
        "get": {
          "operationId": "PostsController_getPostById",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "put": {
          "operationId": "PostsController_updatePost",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdatePostInputModelType"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "PostsController_deleteBlogByID",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/posts/{id}/comments": {
        "get": {
          "operationId": "PostsController_getCommentsByPostId",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "PostsController_postCommentByPostId",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CommentCreateInputModelType"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/posts/{id}/like-status": {
        "put": {
          "operationId": "PostsController_updatePostLikeStatus",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdatePostLikeStatusInputModelType"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/users": {
        "get": {
          "operationId": "UsersController_getUsersWithPagination",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "UsersController_createUser",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserInputModelType"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/users/{id}": {
        "delete": {
          "operationId": "UsersController_deleteUserByID",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/comments/{id}": {
        "get": {
          "operationId": "CommentsController_getPostById",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "put": {
          "operationId": "CommentsController_updateCommentContent",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CommentUpdateInputModelType"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "CommentsController_deleteComment",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/comments/{id}/like-status": {
        "put": {
          "operationId": "CommentsController_updateCommentLikeStatus",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateCommentLikeStatusInputModelType"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/security/devices": {
        "get": {
          "operationId": "SecurityController_getAllUserDevices",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "delete": {
          "operationId": "SecurityController_deleteAllUserDevices",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/security/devices/{id}": {
        "delete": {
          "operationId": "SecurityController_deleteOneUserDevice",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/auth/me": {
        "get": {
          "operationId": "AuthController_getInformationAboutMe",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/auth/login": {
        "post": {
          "operationId": "AuthController_userLogin",
          "parameters": [],
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/auth/refresh-token": {
        "post": {
          "operationId": "AuthController_refreshAccessAndRefreshTokens",
          "parameters": [],
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/auth/logout": {
        "post": {
          "operationId": "AuthController_logout",
          "parameters": [],
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/auth/registration": {
        "post": {
          "operationId": "AuthController_registration",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserInputModelType"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/auth/registration-confirmation": {
        "post": {
          "operationId": "AuthController_registrationConfirmation",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/confirmationCodeType"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/auth/registration-email-resending": {
        "post": {
          "operationId": "AuthController_registrationEmailResending",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EmailResendingModelType"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/auth/password-recovery": {
        "post": {
          "operationId": "AuthController_passwordRecovery",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EmailInputModelType"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/auth/new-password": {
        "post": {
          "operationId": "AuthController_newPassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RecoveryCodeAndNewPasswordType"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      }
    },
    "info": {
      "title": "Cats example",
      "description": "The cats API description",
      "version": "1.0",
      "contact": {}
    },
    "tags": [
      {
        "name": "products",
        "description": ""
      }
    ],
    "servers": [],
    "components": {
      "schemas": {
        "CreateBlogInputModelType": {
          "type": "object",
          "properties": {}
        },
        "CreatePostByBlogIdInputModelType": {
          "type": "object",
          "properties": {}
        },
        "UpdateBlogInputModelType": {
          "type": "object",
          "properties": {}
        },
        "CreatePostInputModelType": {
          "type": "object",
          "properties": {}
        },
        "CommentCreateInputModelType": {
          "type": "object",
          "properties": {}
        },
        "UpdatePostInputModelType": {
          "type": "object",
          "properties": {}
        },
        "UpdatePostLikeStatusInputModelType": {
          "type": "object",
          "properties": {}
        },
        "CreateUserInputModelType": {
          "type": "object",
          "properties": {}
        },
        "CommentUpdateInputModelType": {
          "type": "object",
          "properties": {}
        },
        "UpdateCommentLikeStatusInputModelType": {
          "type": "object",
          "properties": {}
        },
        "confirmationCodeType": {
          "type": "object",
          "properties": {}
        },
        "EmailResendingModelType": {
          "type": "object",
          "properties": {}
        },
        "EmailInputModelType": {
          "type": "object",
          "properties": {}
        },
        "RecoveryCodeAndNewPasswordType": {
          "type": "object",
          "properties": {}
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
