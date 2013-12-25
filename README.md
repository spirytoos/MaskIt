# jQuery MaskIt Plugin
jQuery plugin for masking input fields.

I've created this plugin for fun and simply to sharpen my jQuery plugin development skills. Feel free to use it in your projects, modify, change and do what you will, as long as you keep the copyright note at the top of plugin code. Also if you do something cool with it I would appreciate if you let me know. I would love to put link to it on this site then.

## Compatibility

I tested it briefly with latest Firefox, Chrome, IE7/8/9 on Windows 7, and iPad3 with IOS6. If you find any bugs however, please do let me know on via my blog site http://spirytoos.blogspot.com.au.

## How to use?

Download js file
* [jquery.maskit1.0.js](/js/jquery.maskit1.0.js) (with comments if you dare, ~22kb)
* [jquery.maskit1.0.min.js](/js/jquery.maskit1.0.min.js) (compressed, ~5.5kb)

[Download jQuery](http://jquery.com/download/) (or link to it directly) before using plugin. Then link to plugin, sample code below: 

```html
<script type="text/javascript" src="jquery.min.js"></script>
<script src="jquery.maskit1.0.min.js"></script>
```

When specifying special characters MaskIt uses regular expressions (regex., see examples below). Regex can be complicated and very powerful, however if you not familiar with it I would suggest to Google it as there are heaps of resources on the subject. For those who do not know how to specify regex patterns, few very simple examples below: 
* `[a-c]` - matches any of these characters: abcd
* `[abc]` - matches any of these characters: abc
* `[a-cA-Z]` - matches any of these characters: abc and ABCDE....Z all the way till Z (uppercase)
* `[1-5o-s]` - matches any of these characters: 12345 as well as matches lowercase opqrs
