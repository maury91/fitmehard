# FitMeHard

FitMeHard is an hybrid application, developed for a collage project.
The main request of the collage project is the User Interaction offered by the application and not is functionality.

Even if isn't asked to the application to work correctly, the application can track the exericise correctly.

This application graphic, and the home is inspired by the application "Adidas MiCoach" for Windows Phone. As the other application, this application is designed to show in the home what you have to do today.

## Screens

### Calibration Phase

<img src="images/calibration1.png" width="200">
<img src="images/calibration2.png" width="200">
<img src="images/calibration3.png" width="200">

### Workout Phase

<img src="images/workout.png" width="200">

## Related Files

 - Youtube presentation (funny) : https://www.youtube.com/watch?v=eF0hZ-zJrBI
 - PowerPoint Presentation : https://github.com/maury91/fitmehard/blob/master/presentation/FitMeHard.pptx?raw=true
 - PowerPoint Presentation (youtube) : https://www.youtube.com/watch?v=YUo_8azWCzA
 - Apk : https://github.com/maury91/fitmehard/blob/master/bin/fitmehard.apk?raw=true

## The Goal

The purpuose of this application is to help the user to teach a novel user how to do an exercise.
The application subdivide an exercise in a set of movements, each movement is based in 4 components

  - The initial position of the movement
  - The time to do the movement
  - The direction of the movement
  - The final position of the movement (that usually matches the initial position of the next movement)

When the arm of the user is stopped, the movement is "ended" and can start the next movement if the position is equal to the final position


## Functions

For help the user with his goal, this app give these functions

### Make new exercises

The coach can use the app to make new exercise, this is very simple.

1. The coach tells the apps of how many movements the exercise is composed
2. The coach make every movement with a little pause between them (manteining the position)
3. The coach describe each movement with a set of phrases

### Execute a set of exercises

The user can do the exercises maked by the coach, for every movement of the each excercise the app tells this things :

1. How to do the movement (example : Raise your hands up)
2. If the movement is incomplete the app tell the user how to complete, like "raise more"
3. If the movement is exaggerated the app tell the user to come back, like "lower a little"

Before the exercise start the application describe to the user how to take the first position.

## Development

This app was developed under Telerik Appbuilder (mainly for the help to build fo iOS (cause i don't have xcode or a mac))

In the app i use the icon font maked using icomoon, the main part of the icon are made by me using inkscape. The others are from icomoon.
All other graphical elements are made by editing existing images (downloaded from flaticon) with inkscape.

The libraries i've used are :

- Kendo UI for mobile
- jQuery
- D3.js
- Math.js (for the mean and median functions)

## Todos

 - Convert calibration to orthoganl normalization
