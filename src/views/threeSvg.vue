<template>
  <div class="three-view">
    <div class="videoDiv">
      <video id="myVideo" muted :autoplay="true" width="100%">
        <!-- <video autoplay="true" width="100%"> -->
        <!-- <source src="images/大屏.mp4" type="video/mp4" /> -->
        <source :src="videoUrl" type="video/mp4" />
      </video>
    </div>
    <!-- <img class="svg" :src="svgUrl" /> -->
    <svg
      class="svg"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="100%"
      height="100%"
      viewBox="0 0 920 280"
    >
      <path
        id="山东"
        class="cls-1"
        d="M615,143l-2,2h-3v-1h-9l-6-5h-4v-1l3-1h5l2-2,2-1h8v-1h-8v-1h1v-2h-2v-2l7-1,4-3h4l1-1h5l1-1h3v-1h2l2,1h7l1-1h4v-1h4l4,1h3l1,1h4v4l10,3,2,1h3l6-2h4l1-1h4v-1h3l12,5h5l1,1h3l1,2-16,1-1-1h-4l-7,4-2,1h-9l-1,1h-5l-10,5-1,1h-3l-3,2h-3l-3,3h-3l-2-3h-4l-2,1h-3l-5-1h-2v-2l-2-2Z"
      />
      <path
        id="河北"
        class="cls-2"
        d="M601,131h-7l-1-1h-5l-1-1h-5l-1-2h-5l-2-3h4l1-3,6-3-4-5-3-1,1-2,4-1,1-2h3l1,1,4-1,3-3-1-2-1-1h-4V99h7l1-1-3-1-3-3-1-2,1-2,4-1,1-2,5-1h5v3h-2l1,1,7,1,1-2h8l1,2h3l1-1h4l1,1h5l2-3h13l3,2,2,2v1h-2v1l3,3,1,1h6l1,1h3v1h-3l-1,1v2l5,1v1h5l1,2-10,4-16-1-4-2-2-1,3-1-1-1-4-1-2-2,4-1-2-1h-3l-7-4h-4l-2,2H613l-3,4v3h2l2,2h7l2,1h7l1,1v2l-2,1-1,1,1,1,4,1,3,1,4-1,6,5h-7l-2,1-10-1-5,2h-4l-1,1h-4l-6,3-4,1-2,1v3Z"
      />
      <path
        id="北京"
        class="cls-3"
        d="M640,103h-1v1h-8l-1,1,3,1v1l-3,1h-7l-2-1h-7l-2-2h-2v-3l3-4h12l2-2h4l7,4h3l2,1-4,1Z"
      />
      <path
        id="天津"
        class="cls-3"
        d="M647.667,109.333L646,111h-3l-4,2,4,4-0.438.135L640,115l-4,1-3-1-4-1-1-1,1-1,2-1v-2l-1-1h0l3-1v-1l-3-1,1-1h8v-1h1l1,1,4,1,1,1-3,1,2,1Z"
      />
      <path
        id="上海"
        class="cls-3"
        d="M698,178l-8-1h-4l-1,1,4,2h-3l-2,2h-4l-2,1-2-1-3,1,1,1h9l6-1,2,1,6-1,1-1v-4Z"
      />
      <path
        id="江苏"
        class="cls-4"
        d="M637,158v2h3l2,3,5,4v2h-3l-2,1v1l6,3v2l-1,1h9l2,2h7l3,3,6,1v-3h2v1l3,1h3l3-2h2v-1l-2-2h10s-13.7-11.27-16-15-5-8-5-8l-16-7h-2l-3,1-5,1-2,2h-3l-3-3h-3l-1,1h-5l-1-1h-4l-3-4h-8v1l2,1,3,1,4,2v1l5,1h3l3,3h4l3,1-2,2Z"
      />
      <path
        id="广东"
        class="cls-5"
        d="M472,245s-6.823,5.655-8,6-1.707,3.094-1,3,1,1,1,1-0.368,3.943,1,4,9,0,9,0l9-10s14.288,1.072,18,1,11.508-.659,16-1,9.837-.989,11-1,10.451-3.939,12-4,4.274,3.932,6,4,6.687-1.46,8-2c1.826-.751,10.912-1.077,12-1s8.585,1.1,11,1,3.241-1.064,5-1a20.379,20.379,0,0,0,3,0,17.806,17.806,0,0,0,4-1s-0.514.095,1,0a19.146,19.146,0,0,0,4-1s-0.009.006,1,0a23.014,23.014,0,0,0,4-1v-6l-3-3h-3l-2-2-5-1-1-1h-4v2a24.013,24.013,0,0,1-3,0c-0.083-.125-3-2-3-2h-9l-1,1h-8l-3-2s-0.257-1.737,1-2a8.6,8.6,0,0,0,3-2s4.776,0.422,5-1a2.564,2.564,0,0,0-1-2H552a1.271,1.271,0,0,0-1-1c-0.761-.014-7,0-7,0l-5-2h-1l-3,1-1,3-4,1-2-3h-4l-2-2-2,1a9.34,9.34,0,0,0-1,2,17.035,17.035,0,0,1-3,1l-1,5h-3v3s-4.236.138-5,1-4,1-4,1l-2,2s-0.716,4.494-2,5a2.173,2.173,0,0,1-2,0l-5,1v1h-5v2l-8,1v2Z"
      />
      <path
        id="湖北"
        class="cls-6"
        d="M484,177h-1l-1-1h-2l-1-3-2-1-1-1-3-1,3-2-1-2,3-1h3l3,1,1-1h4l1,1h5l2-2,5,1h1l3-3-1-1-5-2-1-2-1-2,2-2-2-1,2-2h9l1-1-9-4h5l5,1h7l1,1h6s6.927,5.944,7,6,7,2,7,2l3,2h7l1,1h9l7,1v4l3,1h3l2,1h4v2h3l1,1h6l4,3,5,1,3,3-5,1,2,4,2,1v4h-5l-2-2h-3l-2,1h-4l-1-1-1,2h-3l-1,1H567l-5,1h-2l-2-1-2-1,2-2v-2l-1-1s-7.976,2.137-9,2-2-3-2-3h-1a24.106,24.106,0,0,1-4,1c-0.477-.122-6,0-6,0s-5.87-3.473-7-4-8-1-8-1l-1-1h-4l-1-1h-7v1l1,2-5-1-3-2h-6v1h-6S486.191,177.082,484,177Z"
      />
      <path
        id="湖南"
        class="cls-6"
        d="M481,207l-3-2-2-3,1-2,4-3-2-1-8-2,7-2h4l-1-2,1-4,1-1-1-3,3-4,2-2,3-2,4,1,1-2,7,1,5,1,1-3h5l2,2h5l1,1h7l7,4,6,1,4-1,1,1,1,2h3l6-3,3,3-2,4,2,1h2l2,2v3l1,2-4,1-1,1h-4l-1,2-3,1v3h4l-1,1-1,1,1,2-1,2v1h4l-1,2-2,1,3,1-3,2-2,2v2l-3,1h-4l-3-1-2-1h-2l-3,1h-2l1,1-1,2-2,1-2-2-3-2-5-1-2,2-1,1-11,1v-4h-8l4-3,4-2,1-2h2l-4-1,2-3-2-1-2-1-2,2-2-1-2-1h-2l-3,2h-3a25.879,25.879,0,0,0-4-2c-0.854-.144-2.032,1.695-3,2A3.87,3.87,0,0,1,481,207Z"
      />
      <path
        id="广西"
        class="cls-4"
        d="M420,228l-5,5s5.933,5.2,11,6a45.7,45.7,0,0,1,10,3s10.465-.614,12,0,17.369,5.071,18,5,3,0,3,0l2-2h7l1-2s5.861,0.507,6,0,1-3,1-3h6l1-1h5l1-2,1-4,6-2,5-2v-2l3-1v-4s-3.375-.364-4,0a27.706,27.706,0,0,1-4,1v-5a33,33,0,0,1-6,0c-1.414-.353-0.22-2.239,2-3a44.87,44.87,0,0,0,6-3l-3-2,3-3-4-1-3,1-3-2s-6.006,3.158-8,3a8.2,8.2,0,0,1-4-2s-3.09,1.9-4,2-2.4-2.507-4-2a23.53,23.53,0,0,0-4,2h-4l-1,2-2-1h-3l-1-1-2,2h-2l-1-1-4-1-2,3h-7l-1-2h-4l-1-3-3-1-4,3-4,1h-9l-1,2h-4l-6-2s-3.475-2.591-7-2-11,2-11,2v1l9,1s0.839,3.911,3,4c1.268,0.052,9.923.008,11,2a4.525,4.525,0,0,1,0,4,16.565,16.565,0,0,1-6,1c-2.275-.175-4,2-4,2s6.872,1.608,9,2S420,228,420,228Z"
      />
      <path
        id="贵州"
        class="cls-4"
        d="M397,204s-6.523,3.658-6,4,7,0,7,0,5.209-1.756,6-1,9.808,4.4,11,4,2.915-.373,3-2l6-1s3.57,0.059,5,0a18.358,18.358,0,0,0,4-1s1.535-1.808,3-2,6,3,6,3h3l1,2h5l3-2,3-1s0.646,1.846,2,2,3-2,3-2h3v1h1l1-1,4-1,1,1h2v-1h2l1-1v-1l-3-2s1.616-.047,2-1a17.787,17.787,0,0,1,1-2,9.54,9.54,0,0,0,3-1c0.669-.58,0-2,0-2s-7.707.059-10,0c-1.136-.029-0.177-1.75,0-2a28.376,28.376,0,0,1,4-1l1-1h6v-5h1l-1-2s-2.317.686-4,1-7-4-7-4l-2-1v-2a3.9,3.9,0,0,0-1-2h-7s-0.908-2.026-2-2a8.552,8.552,0,0,1-3-1l-2,3-3,1-2-2-3,1s-2.841,1.446-4,2c-1.364.652-2.17-1.035-3-1s-4,0-4,0-3.058-2.128-4-2a9.148,9.148,0,0,1-2,0v1h-5v1a38.19,38.19,0,0,1,4,1,2.389,2.389,0,0,0,0,1s3.971,0.854,5,2,0.211,0.267,0,1-0.886.945-2,1c-0.558.028-2.635,0.007-5,0a16.47,16.47,0,0,0-5,1l-2-2h-2l-3,2H402s-2.817-1.179-3-1a7.448,7.448,0,0,1-2,0v1h-4l-1-1h-2l-3,1v2l-1,2v1h4a32.353,32.353,0,0,1,6,0c1.481,0.359,3.292,1.906,3,3s-7,6-7,6Z"
      />
      <path
        id="福建"
        class="cls-3"
        d="M600,241v-4l-2-5h-3l-3-2-5-1-3-1v-2l2-1,4-4,2-1,3-1,2-2,2-1v-4l8-1,3-1,1-4,3-1,1-1h4v1h4l1-1h8l2-1h5v1l-1,1,1,1,1,1v4l4,1h7v-1h2l2,3,6,1,1-1h3l-1,2s-7.394,5.191-16,10c-8.391,4.689-18,9-18,9s-11.642,3.328-20,5A40.936,40.936,0,0,1,600,241Z"
      />
      <path
        id="浙江"
        class="cls-7"
        d="M652,187h-2l-2-1h-1l-1,3-3,1-2,1-2,1h-4v1h-3l-1,1v1l5,3v4h4l1,2-1,1v1l1,1v3h3l1,1h3l3-1v-1h2l1,2,1,2,4,1h8l12-7,11-1,9-11-9-4-5-6-2,1-1-2h-2v1h-8l-1-2h-3l-4-3h-3l-4,4h-2Z"
      />
      <path
        id="安徽"
        class="cls-8"
        d="M600,174l-5,2,1,2,1,2,2,1v3l1,1h6l1-2h3l2,1v2h-3v1l1,1h2l4-2h2l7,4h7v1l2,1v-1h4l4-1v-1l3-1v-2l1-1h6v-2h3l3-1,1-1v-1h-2l-2-1-1-1h-9l-1-2h3v-2h-2l-5-3v-1l4-2h2v-1h-1v-2h-3l-2-2v-2h-3l-1-1v-2l3-2-6-1v-2h-2v-1h-6l-4-4-3-1-3-2-2,1h-1v1l4,1,1,4h-9l-4-4h-4v4l-4,1-2,2h-6v1l2,1,1,3,4,1h7v4l-2,2h-6l-3,2v1l1,1Z"
      />
      <path
        id="河南"
        class="cls-6"
        d="M525,147v-3l-2-1-2-2v-2l-1-1-1-1v-2h3l6,1,2-2h7l2,1,2-1,4-1,2,1,4-1h4l2,1h5l1-1h7l3-3,2-3h1l5,1,2,1,6,1,5,1h7v2s11.582-.359,10,0-6,1-6,1l-4,1-2,2h-6l-2,1-1,1h4l2,1,2,2,2,1,1,1h9v3l3,1,2,1,1,1v1l-6,1h-2l-5-4h-3l-1,4-4,1-2,2h-6l2,2,1,1v2h2l2,1h8l-1,4-1,1v1l-7,1-3,1h-2l-1-1h-6l-1-1h-2l-1-2h-4l-4-1-2-1a3.975,3.975,0,0,1-1-3c0.345-1.48-1-1-1-1h-5l-1-1H548l-2-1-5-1h-1l-2-1-2-1h-5Z"
      />
      <path
        id="江西"
        class="cls-6"
        d="M552,221v-5l1-1h1l1-1h2l-3-2,1-1,2-1-3-1-1-1,1-2,1-1h-2l1-2,1-1-3-1-1-1,2-2h1l1-2h4l1-1,3-1,1-1-1-1v-2l-1-1-2-2,7-1h9l2-1h4l5-1,1-1h5l1,2h12l1-2h3l1,1,1,1-1,1h-3l1,1s1.059,1.3,2,1,4-1,4-1l1-1h2l2,1,3,2a4.267,4.267,0,0,1,2,1c0.67,0.737,6,1,6,1l1,1-2,1v2l5,3v4l-2,1h-1l-4,1h-4a2.213,2.213,0,0,1-2,1,2.24,2.24,0,0,1-2-1l-1-1-5,1-2,1h-2v4s-3.073,1.988-4,2-5,0-5,0l-2,1v4h-3v2l-1,1h-5l-4,5-2,1v4l-3-1v3h-2l-4-2h-9l-2,1h-7l-4-3,4-1,1-2h5l1-2s-2.336-1.379-3-1S552,221,552,221Z"
      />
      <path
        id="云南"
        class="cls-5"
        d="M301,167s4.477,3.079,5,3,1,1,1,1l-7,14-19,5-8,10h17v9l10,4-9,7,15,6,16-1-2,5v2l8,1,2-11,15-1,19,1,17,1,16-4,4,3h2v-1h8l2-2v-2h-6l-2-1h-3l-3-1-1-3h-8v-4l5-5-5-4,7-5,1-2-2-1H386l-1-1v-2l1-1-2-1v-1l4-1h4l2,1,3-1v-1h3l2,2h10l2-2v-3h-3l-1,1h-8l-2-2-1-1h2v-2h-1v-2l-6-1v3h-6v2l-8,3-5,1-2,3v4l-1,1-5,1-2,1-1-2-5,1h-8l-3-2v-2l-2-1,1-1-1-2-6-9h-6l-3-4v-1h2l-4-5-5,2-2,3h-2l-1-3v-4h-4v-1h-1l-1,2h-1v4h-7v-1h-2Z"
      />
      <path
        id="重庆"
        class="cls-4"
        d="M432,174l-4-1-1-1v-2h-2l-2-2v-1h4l4-2v-1l-1-1,2-1h2l3,1,7,1,3,2,4,1,4-1,4-3,2-2h4l1,1,3-1,6-4,3-1,3-1v-1h-2v-2l3-1,11,6h4l7,4h1v1l-1,1-1,2h-2l-1-1h-4l-1,2h-5v-1H474v1l2,1-4,4h4l4,4,2,1v1l1,1v2l-1,1v2l-4,2h-3l-1-3h-2v-2l-2,2-1-2v-4h-8l-3-1-4-1-1,3h-3l-2-1h-5v2h-3v-2h-1v-1h-2v2h-2v-2Z"
      />
      <path
        id="西藏"
        class="cls-9"
        d="M209,92l3,1-2,3-4,1v2l3,1-2,2-1,3-3,1v1l9,7h7l3-1,2,1,3,3,3,1h3l2,1,3,1h6l7,3h5l1,1h12l5,4h4l1,2-1,1,1,1h3v1h5l1-1h3l2,2h4v-2h8l6-3h0l9,2,3,4v2l3,2v2l-3,1,3,4-1,2-1,5-2,1-1,4-3,3h-2l-3-1-3,3,1,1v2h-4l-1-2h-3v2h-2l-2-4-13-1-9-2,4-3-5-6-16,1s-2.523-2.808-9-3-39,8-39,8H198l-5-4h-7a51.408,51.408,0,0,0-9-3c-5.37-1.29-25,5-25,5l3-6H142a94.89,94.89,0,0,1-44-12l-7-1-2-5-9-2L61,118l-7,1-3-1L29,107l-1-2,3-6,8,1,4-4-1-4,4-5H62l6-3,4-1,2-2,3,1,4,1h8l1,2h6l10-2,6,1,1,2,7,1,12,1,4-1h12l2,1,10-1,2-2,21,1,15,1,11.294,4.706Z"
      />
      <path
        id="新疆"
        class="cls-8"
        d="M48,88L39,76,20,70l-1-5s-6.994-3.52-7-6,5-7,5-7l-7-3H5l1-5,5-1,2-2,8-1s16.673-.274,18,0,11.067,2.338,12,2,6.816-3.362,10-3,17,0,17,0l6-2,26-1,5-5,11-1-3-12h35L178,8s20.458,4.252,25,4a56.877,56.877,0,0,0,8-1l6-6h12l11-3h5V7s17.548,5.848,22,6,5,1,5,1l5,6-9,7,4,4,33,4,17,7h4l2,2s0.21,7.283,7,10c0,0-5.511,4.634-6,6,0,0-24.85-2.887-38,5a69.87,69.87,0,0,0-7,0,34.568,34.568,0,0,1-5,0l-1,2-4,2v5H238l-7,1,1,5,7,4,1,3h-8l-2,2,3,1v3l-4,1-3-2-5-1-3-1-2,1h-4l-7-2-5-1-2-2H184l-2-1H163l-4,3h-9l-1-2-13,1-5,1-5-1h-6l-2-1h-5V84l-5-1h-4l-2,1H99l-1,1H92l-3-2H81l-4-2H75l-3,3H67l-5,3Z"
      />
      <path
        id="内蒙古"
        class="cls-10"
        d="M433,104h23l3-2s3.343-6.04,7-7,11-1,11-1l2,3-4,1-5,2,4,2,6,1,5,2,3,1,5,2h8l3-1h4l-1-2,7-2,4-2h5l2-2h4l3,1h5l5-2,2,2,6-1h6l6-3h5l3,1,5-1,5,1h11l1-2-3-2,1-3,5-1,1-2,4-1h6l1,3,4,1,2-1h8l2,1,2,1,1-2h3l2,2,4-1,3-2,3-1,2,1,4-1,5,1,4,4,1,1h-2v1l4,4h6l4,2,4-2V96l1-2-1-2h4l5,1,2,4h2l6-2,11-1,2-1h4l1,2,3-1,2-1h2l1,1,3-1h3l4,1h6l1-1h5l3-3h-5l-1-1,3-1-5-6h-2l-8,1-3-1V81l-3-1V78l3-3-3-3-4-1,2-1h3l2,1h3l4,2,2-1,1-1,5-1-2-2,8-1,1-1-3-1-5,1-4-3-5-2,4-1h8l17-4,3,4,1-1V56l5-3,5,1,1-2-1-2,2-3,11-4V42l-9-5h-2l-4,2-6-1h-5l-5-1h-7l-5-1-4-5,1-1-3-1-3-1h-8l-6-2,5-2,2-1-2-1-2-1H706l1,1,2,2v5h-9l-13,6-2,3h-5l-10,1-7,1-14-4h-3l-18,8,2,3h11l7,1,3,1,8-1h8l3,1,5,1,9,4,5,3-3,5-5-1-6-2-15-1H643l-12,5H601l-8,2h-4l-13-3-9-1-6,2,4,5v2l-13,1-11,3s-28.651.442-30,0a71.267,71.267,0,0,0-12-2c-3.39-.089-30.078.529-32,1s-10,1-10,1l-6-3s-15.424-.436-17-1-19.514-6.164-21-7-21.788-2.7-28-3-36-5-36-5l5,9-3,2,7,4-2,3,4,1,6-3,6,1,2,1,6-1,5,1v2l-14,4,1,1h4l14,5-1,2,5,1,3,3,8-1-2-2h13l5,1,3-1h13l1,4-6,3h-7l-1,2-2,1v1l3,1Z"
      />
      <path
        id="四川"
        class="cls-11"
        d="M321,168l-1-1v-2h0l1-5,1-1v-4l3-2v-5l1-2-3-4,5-1-5-3,1-3-3-3-7-2-3-1,1-2,2-1,4-2h2v-1h-2l-2-2v-1h5v1h7l1,1h4l1,5,6,3,6,2h2l2-1h2v3l1,1,3-1h2l-2,1,1,1h4l1-1h2v1h5v-1h2l-1-3h6l1,1h2l1-1v-2h2v1h-1v2h6l1-1,5-1-2-4h7v-1h4l1,1v3l3,1h2l2,1h7l1,3h1v2l-2,1v2h3l3,2,6,1h6l1-2h1v2h5l2-1h1v1l5,2h10v2l2,1h2l1-1h1v1l5,2,1,1,8-1-1,1-1,1h-1v2h2v1l-5,1-6,5h-2l-1-1h-5a8.069,8.069,0,0,1-2,3,18.776,18.776,0,0,1-6,3,18.013,18.013,0,0,1-5,0l-1-3h-7l-5-2v-1l-3,1-4,1v1l2,1v1h-3v1h-4l-1,1v2l3,2h2v2l1,1h4l2,1,1,1v1h-1l-2-2h-4v1h-5v3h3v2h5l1,1v1H419v-1h-3v-2l-2-1h-4l-1,1h-6l-1-1v-1h1v-2h-1v-2h2v-1h-2l-2-1h-7v3h-6v2l-2,2h-3l-3,2h-5l-2,4v4l-2,1h-3l-2-1-5,1-2,1h-6l-4-5v-1h1v-1h-1l-7-11h-6l-1-1v-1h-1v-1h2l-1-2-4-5h-3Z"
      />
      <path
        id="山西"
        class="cls-12"
        d="M518,135h9l3-1h8v1h2l2-2h4v-1h3v1h7l1,1h5v-1h8l5-5v-1l-3-2v-1l4-1,3-2,4-2,1-2-3-3-4-1v-2l2-2h3v-2l5-1,1,1h3l3-2v-1l-1-2-5-1-1-1V99h7l-1-1V96h-2l-1,1h-7v1l-5-1-2-1h-2l-2,2h-3l-3-2h-3l-6,4h-8l-1,1h-3l-2,2h-2l-4,4-2,1h-3l-1,1v1l3,2v1l-3,3-3,1h-2v3l1,1-1,1-1,1v3l1,1v1l-8,5v2Z"
      />
      <path
        id="陕西"
        class="cls-9"
        d="M497,156h-4l-11-5h-9l-4-3-3-1-4-1-1-1-11-1-4-2-7-1,6-1v-2h-1l3-2,8,2,1-1v-3l5-3-1-1-2-1,2-2,1-1h5l4,2h10l1-1,13-1,1-3,2-1,1-3-19-7v-2l3-2,2-1h6l1,2,11,1,2-2,4-1v-2l20-5,2-1,2,1h2l1,1h3l2-2h3v3h-2l-4,4-6,1-1,3,2,1-1,2-2,2-4,1v5l-1,1v5l-7,6v2l4,7,4,2v3h-6l-18-3h-1v1l9,4v1h-9l-2,1v2l1,1Z"
      />
      <path
        id="甘肃"
        class="cls-9"
        d="M498,119l-1,3-2,1-1,3-13,1-1,1H470l-4-2h-5l-1,1-2,2,2,1,1,1-5,3v3l-1,1-8-2-3,2h1v2l-6,1,7,1,4,2,3.3,0.3-6.3.7-14-3h-5l-5-1-4-2,2-4-3-3-8-1-2-1h-3v-3l-3-2h-5l-1,1-6,1,1,3-4,1-4,1-1-2v-1h-2v-1l-6-1v-1l-4-2v-2h3l10,4,4-1,5-1v-2l-4-2,7-1,3-3,6-1,2-1,2-1,3-2-3-2v-4l-1-1,1-1-7-4V97h-2l-2,2-21-9h-5l-10-6-2-1-4,1-4-1-3,1h-1l-9-4h-5l-5,5-8-2-12-6-33-3V70l2-1,2-3h11s18.468-5.871,20-6,13,0,13,0l6,1,5-5,14-1,5,9-3,1,7,5-1,3,4,1,4-1,6-1,2,1h11l2,2h-3l-3,2-8,1,1,2h5l4,2,3,2,4,1v3h4l4,3h10l-1-2h8l4,1h4l5-1h10l1,3-5,2-6,1-2,2h-2v3l11,4,5,1,1,1,6,3,2,1-1,1v2l1,1-3,3,1,1,5,1,1,1,4,1,1,2h5v-2l8-1v-2l-1-1-4-2v-2l3-1,1-2,10,1v2h3.714Z"
      />
      <path
        id="青海"
        class="cls-9"
        d="M275,74l33,3,12,6,8,2,5-5h5l9,4h1l3-1,4,1,4-1,2,1,10,6h5l21,9,2-2h2v2l7,4-1,1,1,1v4l3,2-3,2-2,1-2,1-6,1-3,3-7,1,4,2v2l-5,1-4,1-10-4h-3v2l4,2v1l6,1v1h2v1h-2v2l-1,1h-2l-1-1h-6l1,3h-2v1h-5v-1h-2l-1,1h-4l-1-1,2-1h-2l-3,1-1-1v-3h-2l-2,1h-2l-6-2-6-3-1-5h-4l-1-1h-7v-1h-5v1l2,2h2v1h-2l-4,2-2,1-1,2-6,3h-8v2h-4l-2-2h-3l-1,1h-5v-1h-3l-1-1,1-1-1-2h-4l-5-4H257l-1-1h-5l-7-3h-6l-3-1-2-1h-3l-3-1-3-3-2-1-3,1h-7l-9-7v-1l3-1,1-3,2-2-3-1V97l4-1,2-3-3-1,1-1,3,1h3l2-1h1l10,3,4-1,1-3-4-1,1-2h9l-1-3-7-4-1-4,5-1,38-1h1Zm107,56,1,2,4-1,4-1-1-3,6-1,1-1h5l3,2v3h3l1.81,0.905-0.762.619L408,131h-2l-3-1v-3l-1-1h-4v1h-7l2,4-5,1-1,1h-6v-2h1v-1Z"
      />
      <path
        id="宁夏"
        class="cls-9"
        d="M477,110l-0.2.88L468,110l-1,2-3,1v2l4,2,1,1v2l-8,1v2h-5l-1-2-4-1-1-1-5-1-1-1,3-3-1-1v-2l1-1-2-1-6-3-1-1-5-1h21l4-1,2-4,6-4,3-1,3-1h5l2,3-4,2-5,2,4,3h6l7,3-6,1Z"
      />
      <path
        id="辽宁"
        class="cls-13"
        d="M675,106v-1l-5-1-2-1h-4v-2l5-1,5-2V92h3l1,1h3l4,5,2-1,1-2h4l1-1h11l2-1h4v2h3l2-2h2l1,1h3l1-1h2l1,1h9l2-1h5l2-2h2l3,2h3l2,3h2l4-1,2,2,5,5-1,1v2l7,5-9,1-15,4H723l-7,2H706l-2-4,1-1,11-4-8-5-33,4v-1Z"
      />
      <path
        id="吉林"
        class="cls-14"
        d="M856,103h-6l-5,2-5-4-6,4H809l-1,3H798l-7-4s-10.98,4.52-13,5a63.563,63.563,0,0,1-6.312.777L765,105v-2l1-1-5-5-2-2-4,1h-2l-2-3h-3l-3-2h-2l-2,2h-1l3-3h-5l-1-1,3-1-5-6h-2l-8,1-3-1V81l-3-1V78l3-3-3-3-4-1,2-1h3l2,1h3l4,2,2-1,1-1,5-1h0l13,1v3l5,3h9l1,2h9s2.885,2.906,4,3,11,0,11,0l2,1h3l1,2v3h7s2.129,3.582,4,4a11.3,11.3,0,0,0,4,0s2.512-2.084,4-2a7.632,7.632,0,0,1,3,1v2l6,5,5-1,2-1h6l3-1,2,2h2l2-1,3,3,3,1,4,1,2,1ZM736,93l-2,1,1-1h1Z"
      />
      <path
        id="黑龙江"
        class="cls-15"
        d="M905,76l-6,8-10,6-16-3-17,1s0.659,2.771,1,4a26.107,26.107,0,0,0,2,4l-1,6-2,1,1-1-2-1-4-1-3-1-3-3-2,1h-2l-2-2-3,1h-6l-2,1-1.63.326-5.425-1.039L817,93V91a7.632,7.632,0,0,0-3-1c-1.488-.084-4,2-4,2a11.3,11.3,0,0,1-4,0c-1.871-.418-4-4-4-4h-7V85l-1-2h-3l-2-1s-9.885.094-11,0-4-3-4-3h-9l-1-2h-9l-5-3V71l-13-1h0l-2-2,8-1,1-1-3-1-5,1-4-3-5-2,4-1h8l17-4,3,4,1-1V56l5-3,5,1,1-2-1-2,2-3,11-4V42l-9-5h-2l-4,2-6-1h-5l-5-1h-7l-5-1-4-5,1-1-3-1-3-1h-8l-6-2,5-2,2-1-2-1-1.421-.711C737,21.9,769.682,23.628,779,28c12.6,5.914,11,7,11,7s14.745,10.513,16,17c0,0,30.943,4.688,36,7s8,4,8,4l6,7h11l13,2s11.846-1.014,14-1,21,0,21,0S911.959,74.722,905,76Z"
      />
      <path
        id="海南"
        class="cls-3"
        d="M448,278l-12-4,1-2,1-6,10-3,22-1,1,1h8l1,4-5,2-3,1-7,5-10,2Z"
      />
      <path id="台湾" class="cls-3" d="M663,265l-8-8v-8l11-9,16-5,6,4-16,17Z" />
      <path id="澳门" class="cls-16" d="M536,244h-6l-4,4,4,1,8-4Z" />
      <path id="香港" class="cls-16" d="M542,245l3-2,4,2,5,1-4,2h-4Z" />
    </svg>
    <canvas id="three"></canvas>

    <!-- <div class="video"></div> -->
  </div>
</template>
<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

import DistrictTerrain from "@/utils/widgets/Terrain/DistrictTerrain.js";
import * as dat from "dat.gui";
// import DistrictTerrain from "@/utils/widgets/Terrain/DistrictTerrainCopy.js";
import { getPublicData } from "@/api/requestData.js";
import * as d3 from "d3-geo";

export default {
  name: "ThreeTerrain",
  data() {
    return {
      videoUrl: "images/大屏.mp4",
      svgUrl: "images/china2.svg",
      autoPlay: true
    };
  },
  created() {},
  async mounted() {
    const svg = document.getElementsByClassName("svg")[0];
    console.log(svg);
    svg.width = 100;
    this.clock = new THREE.Clock();

    this.initScene();
    this.addState();
    this.initControls();
    this.initLight();
    this.loadSvg();
    this.addPickObject();

    this.addClickListener();

    let GUI = document.querySelector(".dg.main.a");
    if (GUI) {
      GUI.remove(); //不删除的话，每次保存时都会多出一个控制面板
    }
    this.initGUI();
    this.animate();
  },
  beforeDestroy() {
    cancelAnimationFrame(this.myAnimate);
    window.removeEventListener("resize", this.onWindowResize);
    this.scene.traverse(item => {
      if (item.isMesh || item instanceof THREE.Sprite) {
        item.geometry.dispose();
        if (item.material instanceof Array) {
          item.material.forEach(material => {
            material.dispose();
          });
        } else {
          item.material.dispose();
        }
      }
    });
    THREE.Cache.clear();
    this.scene.clear();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  },
  methods: {
    initGUI() {
      let guiControls = {
        CameraX: 287.4538996129696,
        CameraY: 596.9465507790738,
        CameraZ: 1276.9078160074046,
        TargetX: 0,
        TargetY: 0,
        TargetZ: 0,
        fov: 35.5,
        aspect: 2.2,
        far: 2000,
        near: 0.1
      };
      this.guiControls = guiControls;
      const gui = new dat.GUI();
      // gui.add(guiControls, "CameraX", 0, 500);
      // gui.add(guiControls, "CameraY", 0, 1000);
      // gui.add(guiControls, "CameraZ", 500, 2500);
      // gui.add(guiControls, "TargetX", -100, 100);
      // gui.add(guiControls, "TargetY", -100, 100);
      // gui.add(guiControls, "TargetZ", -100, 100);
      gui.add(guiControls, "fov", 0, 500);
      gui.add(guiControls, "aspect", 0, 5);
      gui.add(guiControls, "far", 0, 1000);
      gui.add(guiControls, "near", 0, 1000);
    },
    addClickListener() {
      this.renderer.domElement.addEventListener("click", () => {
        console.log(this.camera);
        console.log(this.controls);
      });
    },
    initScene() {
      const scene = new THREE.Scene();
      this.scene = scene;
      // scene.background = new THREE.Color(0x333333);
      const canvas = document.querySelector("#three");
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
      });
      this.renderer = renderer;
      renderer.shadowMap.enabled = true;
      renderer.autoClear = false;
      // renderer.sortObject = false
      //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
      const camera = new THREE.PerspectiveCamera(
        33,
        1920 / 872.72,
        // 1.95,
        -12000,
        1000
      );
      this.camera = camera;

      //调整camera视角
      // camera.position.set(1443.198, 664.809, 691.148);
      camera.position.set(
        345.4933019273467,
        840.8667510302314,
        1451.9076322120293
      );
      camera.position.set(
        345.4933019273467,
        840.8667510302314,
        1451.9076322120293
      );
      // camera.position.set(500, 500, 500);

      console.log(camera);

      // 避免模型很模糊的现象
      let width = window.innerWidth;
      let height = window.innerHeight;
      let canvasPixelWidth = canvas.width / window.devicePixelRatio;
      let canvasPixelHeight = canvas.height / window.devicePixelRatio;
      const needResize =
        canvasPixelWidth !== width || canvasPixelHeight !== height;
      if (needResize) {
        this.renderer.setSize(width, height, false);
      }
      window.addEventListener("resize", this.onWindowResize);
    },
    addState() {
      let state = new Stats();
      this.state = state;
      const container = document.querySelector(".three-view");
      container.appendChild(state.dom);
    },
    initControls(renderer) {
      let controls;
      if (renderer) {
        controls = new OrbitControls(this.camera, renderer.domElement);
      } else {
        controls = new OrbitControls(this.camera, this.renderer.domElement);
      }
      controls.zoomSpeed = 0.5;
      controls.target.set(
        39.80360754786726,
        51.82734281680603,
        -17.39399569424559
      );
      this.controls = controls;
    },
    initLight() {
      this.initAmbientLight();
      // this.initPointLight()
      this.initDirectionalLight();
    },
    initAmbientLight() {
      //环境光
      const ambientLight = new THREE.AmbientLight("#ffffff", 1);
      this.scene.add(ambientLight);
    },
    initDirectionalLight() {
      //方向光
      const dirLight = new THREE.DirectionalLight("#fff", 0.5);
      //光源位置
      dirLight.position.set(20, 40, 15);
      //可以产生阴影
      dirLight.castShadow = true;
      dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);

      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 500;
      dirLight.shadow.camera.left = -400;
      dirLight.shadow.camera.right = 400;
      dirLight.shadow.camera.top = 400;
      dirLight.shadow.camera.bottom = -400;
      this.dirLight = dirLight;
      this.scene.add(dirLight);
      //显示灯光方向
      // var debugCamera1 = new THREE.DirectionalLightHelper(dirLight)
      // this.scene.add(debugCamera1)
    },
    initPointLight() {
      const pointLight = new THREE.PointLight(0xffffff, 0.5, 200);
      pointLight.position.set(50, 50, 0);
      this.scene.add(pointLight);
      // 显示阴影
      // const debugCamera = new THREE.CameraHelper(pointLight.shadow.camera)
      // this.scene.add(debugCamera)
    },
    animate() {
      //three需要动画循环函数，每一帧都执行这个函数
      // this.camera.position.x = this.guiControls.CameraX;
      // this.camera.position.y = this.guiControls.CameraY;
      // this.camera.position.z = this.guiControls.CameraZ;
      // this.controls.target.x = this.guiControls.TargetX;
      // this.controls.target.y = this.guiControls.TargetY;
      // this.controls.target.z = this.guiControls.TargetZ;
      this.camera.fov = this.guiControls.fov;
      this.camera.aspect = this.guiControls.aspect;
      this.camera.far = this.guiControls.far;
      this.camera.near = this.guiControls.near;

      this.renderer.render(this.scene, this.camera);

      this.controls.update(this.clock.getDelta()); //TrackballControls

      const time = this.clock.getElapsedTime();
      if (this.refractor) {
        this.refractor.material.uniforms.time.value = time;
      }

      this.state.update();
      this.myAnimate = requestAnimationFrame(this.animate);
    },
    onWindowResize() {
      // this.composer.setSize( window.innerWidth, window.innerHeight )
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    },
    async getData(url) {
      let data = await getPublicData(url);
      return data.features;
    },
    loadSvg() {
      // instantiate a loader
      const loader = new SVGLoader();

      // load a SVG resource
      loader.load(
        // resource URL
        "data/china.svg",
        // called when the resource is loaded
        data => {
          const paths = data.paths;
          const group = new THREE.Group();

          for (let i = 0; i < paths.length; i++) {
            const path = paths[i];

            const material = new THREE.MeshBasicMaterial({
              color: new THREE.Color(
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.8 + 0.2,
                0.0
              ),
              // color: 0x19bf9e,
              side: THREE.DoubleSide,
              depthWrite: false,
              transparent: true,
              opacity: 0.4
            });

            const shapes = SVGLoader.createShapes(path);

            for (let j = 0; j < shapes.length; j++) {
              const shape = shapes[j];
              const geometry = new THREE.ShapeGeometry(shape);
              const mesh = new THREE.Mesh(geometry, material);
              group.add(mesh);
            }
          }
          console.log(group);
          group.rotation.x = Math.PI / 2;
          this.adjustModel(group);
          this.scene.add(group);
          this.map = group;
        },
        // called when loading is in progresses
        function(xhr) {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        // called when loading has errors
        function(error) {
          console.log("An error happened", error);
        }
      );
    },
    addPickObject() {
      const that = this;
      const raycaster = new THREE.Raycaster();
      let selectedObject;
      this.renderer.domElement.addEventListener("mousemove", onPointerMove);
      // labelRenderer.domElement.addEventListener("mousemove", onPointerMove);
      function onPointerMove(event) {
        let mouse = new THREE.Vector2();
        if (event.isPrimary === false) return;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, that.camera);
        const intersects = raycaster.intersectObject(that.map, true);

        if (intersects.length > 0) {
          if (selectedObject && selectedObject !== intersects[0].object) {
            selectedObject.material.opacity = 0.3;
          }
          if (!selectedObject || selectedObject !== intersects[0].object) {
            selectedObject = intersects[0].object;
            // selectedObject.currentColor = selectedObject.material[0].color.getStyle();
            selectedObject.material.opacity = 0.7;
            // selectedObject.position.set(selectedObject.geometry.boundingSphere.center)
          }
        } else {
          if (selectedObject) {
            selectedObject.material.opacity = 0.3;
          }

          selectedObject = null;
        }
      }
    },
    adjustModel(model) {
      const box = new THREE.Box3().setFromObject(model);
      console.log(box);
      const center = box.getCenter(new THREE.Vector3());
      model.position.x += model.position.x - center.x;
      model.position.y += model.position.y - center.y;
      model.position.z += model.position.z - center.z;

      //调整模型尺寸
      // model.scale.set(0.1, 0.1, 0.1);
      //调整模型中心
      // model.traverse(function(o) {
      //   if (o.isMesh) {
      //     // o.geometry.computeBoundingBox()
      //     o.geometry.center();
      //   }
      // });
    }
  }
};
</script>

<style lang="scss">
#app {
  overflow: hidden;
}
.three-view {
  #three {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 872.72px;
  }
  .svg {
    position: fixed;
    top: 389px;
    right: 461px;
    height: 305px;
  }
  .videoDiv {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
  }
  .cls-1,
  .cls-10,
  .cls-11,
  .cls-12,
  .cls-13,
  .cls-14,
  .cls-15,
  .cls-2,
  .cls-3,
  .cls-4,
  .cls-5,
  .cls-6,
  .cls-7,
  .cls-8,
  .cls-9 {
    fill: #4bfc99;
  }

  .cls-1,
  .cls-10,
  .cls-11,
  .cls-12,
  .cls-13,
  .cls-14,
  .cls-15,
  .cls-16,
  .cls-2,
  .cls-3,
  .cls-4,
  .cls-5,
  .cls-6,
  .cls-7,
  .cls-8,
  .cls-9 {
    fill-rule: evenodd;
  }

  .cls-1 {
    opacity: 0.39;
  }

  .cls-2 {
    opacity: 0.55;
  }

  .cls-4 {
    opacity: 0.6;
  }

  .cls-5 {
    opacity: 0.7;
  }

  .cls-6 {
    fill-opacity: 0.7;
  }

  .cls-7 {
    opacity: 0.48;
  }

  .cls-8 {
    opacity: 0.42;
  }

  .cls-9 {
    opacity: 0.4;
  }

  .cls-10 {
    opacity: 0.3;
  }

  .cls-11 {
    opacity: 0.57;
  }

  .cls-12 {
    opacity: 0.25;
  }

  .cls-13 {
    opacity: 0.5;
  }

  .cls-14 {
    opacity: 0.63;
  }

  .cls-15 {
    opacity: 0.65;
  }
}
</style>
