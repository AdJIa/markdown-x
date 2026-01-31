# OpenCode API Key 配置指南

## 错误原因
OpenCode 默认使用阿里云百炼的模型，需要提供有效的 API Key。

## 配置步骤

### 方法 1: 使用 OpenCode 登录命令
```bash
# 登录阿里云百炼
opencode auth login https://dashscope.aliyun.com

# 会提示输入 API Key
# 从 https://dashscope.aliyun.com/api-key 获取
```

### 方法 2: 手动设置环境变量
```bash
# 临时设置（当前终端）
export DASHSCOPE_API_KEY=your-api-key-here

# 永久设置（添加到 ~/.bashrc 或 ~/.zshrc）
echo 'export DASHSCOPE_API_KEY=your-api-key-here' >> ~/.bashrc
source ~/.bashrc
```

### 方法 3: 创建配置文件
```bash
mkdir -p ~/.opencode

# 创建配置文件
cat > ~/.opencode/config.json << 'EOF'
{
  "providers": {
    "dashscope": {
      "apiKey": "your-api-key-here",
      "baseUrl": "https://dashscope.aliyuncs.com/api/v1"
    }
  },
  "defaultProvider": "dashscope"
}
EOF
```

## 获取 API Key

1. 访问: https://dashscope.aliyun.com/api-key
2. 登录阿里云账号
3. 点击"创建新的 API Key"
4. 复制 API Key

## 验证配置

```bash
# 检查配置
opencode auth list

# 测试调用
opencode run "你好"
```

## 切换其他模型（可选）

如果不想用阿里云，可以配置其他模型：

### OpenAI
```bash
export OPENAI_API_KEY=your-openai-key
opencode run -m openai/gpt-4 "你好"
```

### Moonshot (Kimi)
```bash
export MOONSHOT_API_KEY=your-moonshot-key
opencode run -m moonshot/kimi-k2.5 "你好"
```

## 为 Markdown-X 项目配置

在项目目录下运行：
```bash
cd /home/lujia/clawd/markdown-x

# 设置环境变量
export DASHSCOPE_API_KEY=your-api-key-here

# 测试
opencode run "请检查当前项目的目录结构"
```

## 故障排除

### 错误: "Incorrect API key provided"
- 检查 API Key 是否正确复制
- 检查 API Key 是否过期
- 检查阿里云账号是否有足够额度

### 错误: "Connection refused"
- 检查网络连接
- 检查是否使用了代理

### 错误: "Rate limit exceeded"
- 降低请求频率
- 或升级阿里云百炼套餐

## 推荐

- 开发环境: 使用环境变量方式，方便切换
- 生产环境: 使用配置文件方式，更稳定
