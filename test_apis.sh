#!/bin/bash

BASE_URL=${1:-"http://localhost:3000"}
FORMAT_MODE="pretty"

if [[ "$2" == "--raw" ]]; then
    FORMAT_MODE="raw"
fi

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

HAS_JQ=false
if command -v jq >/dev/null 2>&1; then
    HAS_JQ=true
fi

echo -e "${CYAN}==================================================${NC}"
echo -e "${CYAN}   Qimi API 批量测试${NC}"
echo -e "${CYAN}   目标地址: $BASE_URL${NC}"
echo -e "${CYAN}   模式: $FORMAT_MODE${NC}"
echo -e "${CYAN}==================================================${NC}"

print_api_list() {
    local body=$1
    if [[ "$HAS_JQ" == "true" && "$FORMAT_MODE" == "pretty" ]]; then
        echo "$body" | jq -r '.data.endpoints[] | "  \(.)"'
    else
        echo "$body"
    fi
}

print_weather() {
    local body=$1
    if [[ "$HAS_JQ" == "true" && "$FORMAT_MODE" == "pretty" ]]; then
        local temp=$(echo "$body" | jq -r '.data.current_weather.temperature // empty')
        local wind=$(echo "$body" | jq -r '.data.current_weather.windspeed // empty')
        local city=$(echo "$body" | jq -r '(.data.location // .data) | "纬度: \(.lat // empty), 经度: \(.lon // empty)"')
        echo "  温度: ${temp}°C"
        echo "  风速: ${wind} km/h"
        [[ -n "$city" ]] && echo "  位置: $city"
    else
        echo "$body" | jq .
    fi
}

print_ip() {
    local body=$1
    if [[ "$HAS_JQ" == "true" && "$FORMAT_MODE" == "pretty" ]]; then
        local country=$(echo "$body" | jq -r '.data.country // empty')
        local region=$(echo "$body" | jq -r '.data.regionName // empty')
        local city=$(echo "$body" | jq -r '.data.city // empty')
        local isp=$(echo "$body" | jq -r '.data.isp // empty')
        echo "  国家: ${country}"
        [[ -n "$region" ]] && echo "  地区: ${region}"
        [[ -n "$city" ]] && echo "  城市: ${city}"
        [[ -n "$isp" ]] && echo "  运营商: ${isp}"
    else
        echo "$body" | jq .
    fi
}

print_search() {
    local body=$1
    if [[ "$HAS_JQ" == "true" && "$FORMAT_MODE" == "pretty" ]]; then
        local count=$(echo "$body" | jq -r '.data.count // 0')
        echo "  共 ${count} 条结果:"
        echo "$body" | jq -r '.data.results[]? | "  - \(.title)"' | head -10
    else
        echo "$body" | jq .
    fi
}

print_list() {
    local body=$1
    local title=$2
    if [[ "$HAS_JQ" == "true" && "$FORMAT_MODE" == "pretty" ]]; then
        echo "  $title:"
        echo "$body" | jq -r '.[:10][] | "  \(.index // .rank // ""). \(.title // .word // empty)"' 2>/dev/null | head -10
    else
        echo "$body" | jq .
    fi
}

print_history() {
    local body=$1
    if [[ "$HAS_JQ" == "true" && "$FORMAT_MODE" == "pretty" ]]; then
        local count=$(echo "$body" | jq 'length')
        echo "  共 ${count} 条历史事件:"
        echo "$body" | jq -r '.[]? | "  \(.year) - \(.title)"' | head -8
    else
        echo "$body" | jq .
    fi
}

print_lunar() {
    local body=$1
    if [[ "$HAS_JQ" == "true" && "$FORMAT_MODE" == "pretty" ]]; then
        local solar=$(echo "$body" | jq -r '.data.solar | "\(.year)年\(.month)月\(.day)日 \(.weekday)"')
        local lunar=$(echo "$body" | jq -r '.data.lunar | "农历\(.monthName)\(.dayName)"')
        local ganzhi=$(echo "$body" | jq -r '.data.ganzhi | "干支: \(.year)年 \(.month)月 \(.day)日 \(.hour)时"')
        echo "  阳历: ${solar}"
        echo "  ${lunar}"
        echo "  ${ganzhi}"
        local yi=$(echo "$body" | jq -r '.data.yi | join("、")')
        local ji=$(echo "$body" | jq -r '.data.ji | join("、")')
        [[ -n "$yi" ]] && echo "  宜: ${yi}"
        [[ -n "$ji" ]] && echo "  忌: ${ji}"
    else
        echo "$body" | jq .
    fi
}

print_60s() {
    local body=$1
    if [[ "$HAS_JQ" == "true" && "$FORMAT_MODE" == "pretty" ]]; then
        local count=$(echo "$body" | jq 'length')
        echo "  共 ${count} 条新闻:"
        echo "$body" | jq -r '.[]? | "  - \(.)"' | head -6
    else
        echo "$body" | jq .
    fi
}

print_hot() {
    local body=$1
    if [[ "$HAS_JQ" == "true" && "$FORMAT_MODE" == "pretty" ]]; then
        local platforms=$(echo "$body" | jq -r '.[].name' 2>/dev/null | head -10 | tr '\n' ', ')
        echo "  平台: ${platforms%,}"
        echo "  各平台热搜数据已缓存"
    else
        echo "$body" | jq .
    fi
}

print_suggest() {
    local body=$1
    if [[ "$HAS_JQ" == "true" && "$FORMAT_MODE" == "pretty" ]]; then
        local suggestions=$(echo "$body" | jq -r '.data.suggestions[]?')
        if [[ -n "$suggestions" ]]; then
            echo "  建议词:"
            echo "$body" | jq -r '.data.suggestions[]? | "  - \(.)"'
        else
            echo "  无建议"
        fi
    else
        echo "$body" | jq .
    fi
}

test_endpoint() {
    local name=$1
    local path=$2
    local parser=$3

    echo -e "\n${YELLOW}测试: $name${NC}"
    echo -e "路径: ${path}"

    raw_response=$(curl -s -w "\n%{http_code}" "$BASE_URL$path")
    http_code=$(echo "$raw_response" | tail -n 1)
    body=$(echo "$raw_response" | head -n -1)

    if [[ "$http_code" == "200" ]]; then
        echo -e "状态: ${GREEN}成功${NC}"
    else
        echo -e "状态: ${RED}失败 ($http_code)${NC}"
    fi

    echo -e "响应:"
    if [[ "$FORMAT_MODE" == "raw" ]]; then
        echo "$body" | jq . 2>/dev/null || echo "$body"
    else
        case "$parser" in
            "api_list") print_api_list "$body" ;;
            "weather") print_weather "$body" ;;
            "ip") print_ip "$body" ;;
            "search") print_search "$body" ;;
            "hot_list") print_list "$body" "热搜" ;;
            "history") print_history "$body" ;;
            "lunar") print_lunar "$body" ;;
            "60s") print_60s "$body" ;;
            "hot") print_hot "$body" ;;
            "suggest") print_suggest "$body" ;;
            *) echo "$body" | jq . 2>/dev/null || echo "$body" ;;
        esac
    fi

    echo -e "${CYAN}--------------------------------------------------${NC}"
}

test_endpoint "API 文档" "/api" "api_list"
test_endpoint "天气 (自动定位)" "/api/weather" "weather"
test_endpoint "天气 (上海)" "/api/weather?latitude=31.23&longitude=121.47" "weather"
test_endpoint "IP 定位" "/api/ip" "ip"
test_endpoint "IP 定位 (指定IP)" "/api/ip?query=8.8.8.8" "ip"
test_endpoint "Bing 搜索" "/api/search?q=javascript&count=5" "search"
test_endpoint "B站热榜" "/api/bilibili" "hot_list"
test_endpoint "历史上的今天" "/api/history?month=10&day=01" "history"
test_endpoint "百度搜索建议" "/api/suggest?q=javascript" "suggest"
test_endpoint "百度搜索" "/api/baidu-search?q=javascript" "search"
test_endpoint "农历黄历" "/api/lunar" "lunar"
test_endpoint "60秒读懂世界" "/api/60s" "60s"
test_endpoint "微博热搜" "/api/hot/weibo" "hot_list"
test_endpoint "百度热搜" "/api/hot/baidu" "hot_list"
test_endpoint "抖音热搜" "/api/hot/douyin" "hot_list"
test_endpoint "B站热搜" "/api/hot/bilibili" "hot_list"
test_endpoint "知乎热搜" "/api/hot/zhihu" "hot_list"
test_endpoint "腾讯新闻热榜" "/api/hot/qqnews-hot" "hot_list"
test_endpoint "腾讯新闻精选" "/api/hot/qqnews-curation" "hot_list"
test_endpoint "网易新闻头条" "/api/hot/news163-toutiao" "hot_list"

echo -e "\n${GREEN}测试完毕${NC}"
