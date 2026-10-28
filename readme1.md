# General flow
user -> middleware -> routes -> controllers -> services -> database


# Our current flow
app module -> auth module -> auth controller -> auth service -> user service -> Database

# Data tranfer object -- To send data between services