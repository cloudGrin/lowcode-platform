'use strict'

module.exports = {
  types: [
    { value: 'feat', name: '特性(feat):  新功能' },
    { value: 'fix', name: '修复(fix):  修改bug' },
    { value: 'chore', name: '工具(chore):  改变构建流程，依赖库，工具等' },
    { value: 'perf', name: '性能(perf):  性能优化' },
    { value: 'style', name: '格式(style):  代码格式化相关，与功能无关的改动' },
    { value: 'docs', name: '文档(docs):  修改文档' },
    { value: 'refactor', name: '重构(refactor):  重构代码' },
    { value: 'test', name: '测试(test):  测试用例相关修改' },
    { value: 'revert', name: '回滚(revert):  代码回退' }
  ],

  scopes: [],

  // it needs to match the value for field type. Eg.: 'fix'
  /*
  scopeOverrides: {
    fix: [
      {name: 'merge'},
      {name: 'style'},
      {name: 'e2eTest'},
      {name: 'unitTest'}
    ]
  },
  */
  // override the messages, defaults are as follows
  messages: {
    type: '\n选择你要提交的类型:',
    scope: '\n表明修改的范围 (可选):',
    // used if allowCustomScopes is true
    customScope: '请输入自定义的范围:',
    subject: '填写此次提交的简短描述（必填）:\n',
    body: '提供改动的详细描述 (可选). 使用 "|" 换行:\n',
    breaking: '罗列破坏性更新事项 (可选):\n',
    footer: '罗列改动涉及到的issue相关 (可选). E.g.: #31, #34:\n',
    confirmCommit: '确认提交，回车默认yes?'
  },

  allowCustomScopes: true,
  allowBreakingChanges: [],
  // skip any questions you want
  skipQuestions: ['scope', 'body', 'footer'],
  // limit subject length
  subjectLimit: 100
}
