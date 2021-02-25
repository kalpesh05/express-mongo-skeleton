# express-mongo-skeleton
Skeleton for express mongo app, with basic auth related fuction setup 
* Also had sendgrid function to send mails 


# Structure brief explanation
    * api [ has almost all logic which used for make api endpoint available to use ]
        * constants 
            * errorMessage      [ All error  message inside this file , which we can use in any file]
            * successMessage    [ All success message inside this file , which we can use in any file]
        * controller            [ Has all controller inside we write our logic to perform task ]
        * middlewares           [ All middleware such apiAuth,  response formatter, validation ]
        * routes                [ All endpoint listed here which we should use]
        * validators            [ All validation schema using joi , as per api ]
    * config                    [ Contains all general configuration which we used in project ]
    * helpers                   [ Anything which you make it common logic we can reuse , put here. as name state ] 
    * loaders                   [ It contains all common and necessary files such as express, mongoose, passport, logger ]
    * models                    [ It contains all mongo schema for collection ]
    * services                  [ It contains all services related to model to perform crud with mongo]
    * app.js                    [ Our main entry point , where all this load and listen express server at port noted in config]


# sample.env
    * use this file to maintain you env variable names , don't add actually value with respect env variable. it is not good practice 